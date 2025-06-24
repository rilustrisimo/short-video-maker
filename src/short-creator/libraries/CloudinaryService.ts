import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs-extra';
import { logger } from '../../logger';
import { Config } from '../../config';

export class CloudinaryService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  /**
   * Upload video to Cloudinary and return the secure URL
   * @param videoPath - Local path to the video file
   * @param videoId - Unique identifier for the video
   * @returns Promise<string> - The secure URL of the uploaded video
   */
  async uploadVideo(videoPath: string, videoId: string): Promise<string> {
    try {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      logger.info({ videoId, videoPath }, 'Uploading video to Cloudinary');

      const result = await cloudinary.uploader.upload(videoPath, {
        resource_type: "video",
        folder: "short-videos",
        public_id: videoId,
        overwrite: true,
        transformation: [
          {
            quality: "auto",
            format: "mp4"
          }
        ]
      });

      logger.info({ 
        videoId, 
        cloudinaryUrl: result.secure_url,
        size: result.bytes,
        duration: result.duration 
      }, 'Video uploaded to Cloudinary successfully');

      return result.secure_url;

    } catch (error) {
      logger.error({ error, videoId, videoPath }, 'Failed to upload video to Cloudinary');
      throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete video from Cloudinary
   * @param videoId - Unique identifier for the video
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      logger.info({ videoId }, 'Deleting video from Cloudinary');
      
      await cloudinary.uploader.destroy(`short-videos/${videoId}`, {
        resource_type: "video"
      });

      logger.info({ videoId }, 'Video deleted from Cloudinary successfully');
    } catch (error) {
      logger.error({ error, videoId }, 'Failed to delete video from Cloudinary');
      throw new Error(`Cloudinary deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
}
