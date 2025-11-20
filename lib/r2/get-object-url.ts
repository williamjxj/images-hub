/**
 * Generate presigned URLs for R2 objects
 *
 * Creates time-limited presigned URLs for secure image access
 */

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./client";
import type { R2BucketName } from "@/types/r2";

/**
 * Generate a presigned URL for accessing an R2 object
 *
 * @param bucket - Bucket name
 * @param key - Object key/path
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Object with presigned URL and expiration timestamp
 */
export async function getPresignedUrl(
  bucket: R2BucketName,
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url: string; expiresAt: Date }> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(getR2Client(), command, {
      expiresIn,
    });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      url,
      expiresAt,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}
