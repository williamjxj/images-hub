import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { UploadResult } from "./types";

/**
 * R2 upload client using AWS SDK
 */
export class R2Client {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || "static-assets";

    this.client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_KEY!,
      },
    });
  }

  /**
   * Upload image buffer to R2 bucket
   */
  async uploadImage(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      });

      await this.client.send(command);

      // Construct public URL
      const url = `${process.env.R2_ENDPOINT_URL}/${this.bucketName}/${key}`;

      return {
        success: true,
        key,
        url,
      };
    } catch (error) {
      console.error(`Failed to upload ${key}:`, error);
      return {
        success: false,
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get content type from file extension
   */
  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      default:
        return "image/jpeg";
    }
  }

  /**
   * Upload image with automatic content type detection
   */
  async uploadImageFile(
    buffer: Buffer,
    filename: string
  ): Promise<UploadResult> {
    const contentType = this.getContentType(filename);
    return this.uploadImage(buffer, filename, contentType);
  }
}
