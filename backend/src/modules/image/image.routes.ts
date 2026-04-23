import { Router, Request, Response } from 'express';
import { uploadMiddleware, imageRateLimiter } from '../../middleware/imageUpload';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import ImageService from './image.service';

const router = Router();

/**
 * POST /images/upload
 * Upload image to S3
 */
router.post(
  '/upload',
  authenticateUser,
  imageRateLimiter,
  uploadMiddleware.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const file = (req as any).file;

      console.log(`[IMAGE] Upload request - User: ${userId}, File: ${file?.originalname}, Size: ${file?.size} bytes`);

      if (!file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const validation = ImageService.validateImage(file!);
      if (!validation.valid) {
        console.warn(`[IMAGE] Validation failed - ${validation.error}`);
        res.status(400).json({ error: validation.error });
        return;
      }

      console.log(`[IMAGE] Starting upload to S3 for user ${userId}`);
      const imageUrl = await ImageService.uploadToS3(
        file!.buffer,
        file!.originalname,
        userId,
        file!.mimetype
      );

      console.log(`[IMAGE] Upload successful - URL: ${imageUrl}`);
      res.status(200).json({
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          size: file!.size,
          mimetype: file!.mimetype,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('[IMAGE] Upload error:', error);
      res.status(500).json({ error: error?.message || 'Failed to upload image' });
    }
  }
);

/**
 * DELETE /images/:imageUrl
 * Delete image from S3
 */
router.delete(
  '/:imageUrl',
  authenticateUser,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { imageUrl } = req.params;
      const decodedUrl = decodeURIComponent(imageUrl);

      await ImageService.deleteFromS3(decodedUrl);

      res.status(200).json({
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to delete image' });
    }
  }
);

export default router;
