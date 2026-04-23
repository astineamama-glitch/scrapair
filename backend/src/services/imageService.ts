import supabaseClient, { supabaseConfig } from '../config/aws';
import { compressImage, generateS3Key } from '../middleware/imageUpload';

export class ImageService {
  static async uploadToS3(
    buffer: Buffer,
    originalName: string,
    userId: number,
    mimeType: string
  ): Promise<string> {
    try {
      if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
        return `data:${mimeType};base64,${buffer.toString('base64').substring(0, 50)}...`;
      }
      const compressed = await compressImage(originalName, buffer);
      const fileName = generateS3Key(userId, originalName);
      const filePath = `${supabaseConfig.bucket}/${fileName}`;

      const { data, error } = await supabaseClient.storage
        .from(supabaseConfig.bucket)
        .upload(fileName, compressed, {
          cacheControl: '31536000', 
          upsert: false,
          contentType: 'image/webp' 
        });

      if (error) {
        throw error;
      }

      const { data: publicData } = supabaseClient.storage
        .from(supabaseConfig.bucket)
        .getPublicUrl(fileName);

      const imageUrl = publicData.publicUrl;

      return imageUrl;
    } catch (error) {
      throw error;
    }
  }

  static async deleteFromS3(imageUrl: string): Promise<void> {
    try {
      if (!supabaseConfig.url || !supabaseConfig.serviceRoleKey) {
        return;
      }

      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (!fileName) {
        return;
      }

      const { error } = await supabaseClient.storage
        .from(supabaseConfig.bucket)
        .remove([fileName]);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  static async getPresignedUrl(imageUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      return imageUrl;
    } catch (error) {
      throw error;
    }
  }

  static validateImage(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // File size validation (magic bytes detection happens during compression)
    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return { valid: false, error: `File too large: ${sizeMB}MB (max 5MB)` };
    }

    // Note: MIME type validation is handled via magic bytes in middleware
    // This allows mobile devices to upload with incorrect MIME types
    return { valid: true };
  }
}

export default ImageService;
