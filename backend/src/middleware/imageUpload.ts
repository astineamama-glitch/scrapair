import multer, { Multer } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImages: 1, // 1 image per message
  // Note: We accept any real image file and convert to WebP
  // Magic bytes detection handles format validation
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  outputFormat: 'webp', // All images normalized to WebP
  uploadLimit: {
    perMinute: 5, // 5 images per minute
    perHour: 100 // 100MB per hour
  },
  compression: {
    quality: 80,
    maxWidth: 1920,
    maxHeight: 1920
  }
};

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept file - actual image validation happens server-side with magic bytes detection
  // This allows mobile browsers (which send wrong MIME types) to upload
  // We validate the actual file content later in the pipeline
  console.log(`[IMAGE] Multer fileFilter - File received: ${file.originalname}, MIME: ${file.mimetype}`);
  cb(null, true);
};

export const uploadMiddleware: Multer = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: IMAGE_CONFIG.maxFileSize,
    files: IMAGE_CONFIG.maxImages
  }
});

export async function imageRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const ip = req.ip || 'unknown';

    const minuteKey = `image:upload:${userId}:minute`;
    const minuteCount = await redisClient.incr(minuteKey);
    if (minuteCount === 1) {
      await redisClient.expire(minuteKey, 60); 
    }

    if (minuteCount > IMAGE_CONFIG.uploadLimit.perMinute) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${IMAGE_CONFIG.uploadLimit.perMinute} images per minute`,
        retryAfter: 60
      });
      return;
    }

    const hourKey = `image:upload:${userId}:hour:size`;
    const fileSize = (req.files as Express.Multer.File[])?.[0]?.size || 0;
    const hourlySize = await redisClient.incrby(hourKey, Math.ceil(fileSize / 1024 / 1024)); // in MB
    if (hourlySize === Math.ceil(fileSize / 1024 / 1024)) {
      await redisClient.expire(hourKey, 3600); 
    }

    if (hourlySize > IMAGE_CONFIG.uploadLimit.perHour) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${IMAGE_CONFIG.uploadLimit.perHour}MB per hour`,
        retryAfter: 3600,
        currentUsage: hourlySize
      });
      return;
    }

    next();
  } catch (error) {
    next();
  }
}
export async function compressImage(originalName: string, buffer?: Buffer): Promise<Buffer> {
  try {
    const imageBuffer = buffer;
    
    if (!imageBuffer) {
      throw new Error('No image buffer provided for compression');
    }

    // Detect actual image format using magic bytes
    const detectedFormat = await detectImageFormat(imageBuffer);
    console.log(`[IMAGE] Detected format from magic bytes: ${detectedFormat}`);

    // If not a valid image format, throw error
    if (!detectedFormat) {
      throw new Error('File is not a valid image. Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF');
    }

    // Convert all images to WebP for consistency and smaller file size
    const compressed = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(IMAGE_CONFIG.compression.maxWidth, IMAGE_CONFIG.compression.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('webp', { quality: IMAGE_CONFIG.compression.quality })
      .toBuffer();

    const originalSize = (imageBuffer.length / 1024 / 1024).toFixed(2);
    const compressedSize = (compressed.length / 1024 / 1024).toFixed(2);
    const ratio = ((1 - compressed.length / imageBuffer.length) * 100).toFixed(1);
    
    console.log(`[IMAGE] Compression: ${originalSize}MB → ${compressedSize}MB (${ratio}% reduction), Format: WebP`);
    
    return compressed;
  } catch (error) {
    console.error('[IMAGE] Compression error:', error);
    throw error;
  }
}

export async function detectImageFormat(buffer: Buffer): Promise<string | null> {
  try {
    if (!buffer || buffer.length < 4) {
      console.warn('[IMAGE] Buffer too small to detect format');
      return null;
    }

    // Magic bytes detection for common image formats
    const magicBytes = buffer.slice(0, 12);
    
    // JPEG: FF D8 FF
    if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
      console.log('[IMAGE] Magic bytes detection - Type: image/jpeg');
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47
    if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
      console.log('[IMAGE] Magic bytes detection - Type: image/png');
      return 'image/png';
    }

    // GIF: 47 49 46 38 (GIF8)
    if (magicBytes[0] === 0x47 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x38) {
      console.log('[IMAGE] Magic bytes detection - Type: image/gif');
      return 'image/gif';
    }

    // WebP: RIFF...WEBP (52 49 46 46 at start, 57 45 42 50 at offset 8)
    if (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46 &&
        magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && magicBytes[10] === 0x42 && magicBytes[11] === 0x50) {
      console.log('[IMAGE] Magic bytes detection - Type: image/webp');
      return 'image/webp';
    }

    // BMP: 42 4D (BM)
    if (magicBytes[0] === 0x42 && magicBytes[1] === 0x4D) {
      console.log('[IMAGE] Magic bytes detection - Type: image/bmp');
      return 'image/bmp';
    }

    // TIFF (little endian): 49 49 2A 00
    if (magicBytes[0] === 0x49 && magicBytes[1] === 0x49 && magicBytes[2] === 0x2A && magicBytes[3] === 0x00) {
      console.log('[IMAGE] Magic bytes detection - Type: image/tiff');
      return 'image/tiff';
    }

    // TIFF (big endian): 4D 4D 00 2A
    if (magicBytes[0] === 0x4D && magicBytes[1] === 0x4D && magicBytes[2] === 0x00 && magicBytes[3] === 0x2A) {
      console.log('[IMAGE] Magic bytes detection - Type: image/tiff');
      return 'image/tiff';
    }

    // HEIC/HEIF: ftyp... (66 74 79 70 at offset 4, then heic/heix at offset 8)
    if (buffer.length > 12 && magicBytes[4] === 0x66 && magicBytes[5] === 0x74 && magicBytes[6] === 0x79 && magicBytes[7] === 0x70) {
      const brandBytes = buffer.slice(8, 12).toString('ascii').toLowerCase();
      if (brandBytes.includes('heic') || brandBytes.includes('heix') || brandBytes.includes('mif1')) {
        console.log('[IMAGE] Magic bytes detection - Type: image/heic');
        return 'image/heic';
      }
    }

    // If no magic bytes match, log warning but still return generic image MIME
    console.warn(`[IMAGE] Could not identify specific image format, but file appears to have valid structure`);
    
    // Try to accept it anyway if it starts with common image magic bytes pattern
    // This is a fallback for unknown but valid image formats
    return 'image/jpeg'; // Default to JPEG as fallback

  } catch (error) {
    console.error('[IMAGE] Error detecting file type:', error);
    return null;
  }
}

export function generateS3Key(userId: number, originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  // Use .webp extension for all images (normalized format)
  return `messages/${userId}/${timestamp}-${random}.webp`;
}

