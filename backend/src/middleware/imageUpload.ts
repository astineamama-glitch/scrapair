import multer, { Multer } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB ra
  maxImages: 1, // 1 image per message
  allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
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
  // Validate MIME type
  if (!IMAGE_CONFIG.allowedMimes.includes(file.mimetype)) {
    return cb(new Error(`âŒ Invalid file type. Allowed: ${IMAGE_CONFIG.allowedMimes.join(', ')}`));
  }

  const ext = (file.originalname.match(/\.[^.]*$/) || [''])[0].toLowerCase();
  if (!IMAGE_CONFIG.allowedExtensions.includes(ext)) {
    return cb(new Error(`âŒ Invalid file extension. Allowed: ${IMAGE_CONFIG.allowedExtensions.join(', ')}`));
  }

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

    const compressed = await sharp(imageBuffer)
      .rotate() 
      .resize(IMAGE_CONFIG.compression.maxWidth, IMAGE_CONFIG.compression.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('jpeg', { quality: IMAGE_CONFIG.compression.quality, progressive: true })
      .toBuffer();

    const originalSize = (imageBuffer.length / 1024 / 1024).toFixed(2);
    const compressedSize = (compressed.length / 1024 / 1024).toFixed(2);
    const ratio = ((1 - compressed.length / imageBuffer.length) * 100).toFixed(1);
    return compressed;
  } catch (error) {
    throw error;
  }
}

export function generateS3Key(userId: number, originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `messages/${userId}/${timestamp}-${random}-${sanitized}`;
}

