/**
 * List objects from R2 bucket
 * 
 * Provides functionality to list images and folders from Cloudflare R2 buckets
 * with support for folder navigation and pagination
 */

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getR2Client } from "./client";
import type { R2BucketName, R2Object, R2ListResponse } from "@/types/r2";
import { isMediaFile, getMediaType } from "@/lib/utils/image-utils";
import { sortImagesByDate } from "@/lib/utils/image-utils";

/**
 * List objects (images and folders) in an R2 bucket
 * 
 * @param bucket - Bucket name
 * @param prefix - Folder path prefix (empty string for root)
 * @param cursor - Continuation token for pagination
 * @param limit - Maximum number of objects to return (default: 100)
 * @returns Response with objects, folders, pagination info
 */
export async function listObjects(
  bucket: R2BucketName,
  prefix: string = "",
  cursor?: string,
  limit: number = 100
): Promise<R2ListResponse> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/", // Group by folder
      MaxKeys: limit,
      ContinuationToken: cursor,
    });

    const response = await getR2Client().send(command);

    // Extract folders from CommonPrefixes
    const folders: R2Object[] =
      response.CommonPrefixes?.map((commonPrefix) => {
        const prefixKey = commonPrefix.Prefix!;
        // Extract folder name from prefix (e.g., "images/2024/" -> "2024")
        const parts = prefixKey.split("/").filter(Boolean);
        const folderName = parts[parts.length - 1] || prefixKey;
        
        return {
          key: prefixKey,
          name: folderName,
          size: 0,
          lastModified: new Date(),
          isFolder: true,
          url: null,
          urlExpiresAt: null,
          mimeType: null,
          type: "",
        };
      }) || [];

    // Extract files from Contents, filter to images and videos
    const files: R2Object[] =
      response.Contents?.filter((obj) => {
        // Exclude folder markers (keys ending with /)
        if (!obj.Key || obj.Key.endsWith("/")) {
          return false;
        }
        // Filter to supported media formats (images and videos)
        return isMediaFile(obj.Key);
      }).map((obj) => {
        const key = obj.Key!;
        const mediaType = getMediaType(key) || "image";
        return {
          key,
          name: key.split("/").pop() || key,
          size: obj.Size || 0,
          lastModified: obj.LastModified || new Date(),
          isFolder: false,
          url: null, // Will be generated separately via getPresignedUrl
          urlExpiresAt: null,
          mimeType: null, // Could be extracted from metadata if available
          type: key.split(".").pop()?.toLowerCase() || "",
          mediaType: mediaType as "image" | "video",
        };
      }) || [];

    // Sort images by date (newest first) per FR-006a
    const sortedFiles = sortImagesByDate(files);

    return {
      objects: sortedFiles,
      folders,
      hasMore: response.IsTruncated || false,
      nextToken: response.NextContinuationToken || null,
    };
  } catch (error) {
    console.error("Error listing R2 objects:", error);
    throw error;
  }
}

