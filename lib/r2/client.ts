/**
 * R2 Client Configuration
 *
 * Initializes and exports the S3-compatible client for Cloudflare R2
 * Following the pim-gallery pattern with multi-bucket support
 *
 * NOTE: This file should only be imported in server-side code (API routes, server components)
 * For client-side code, import from lib/r2/constants.ts instead
 */

import { S3Client } from "@aws-sdk/client-s3";

/**
 * Check if R2 environment variables are configured
 * @returns true if all required environment variables are present
 */
export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
  );
}

/**
 * Get R2 endpoint URL from account ID
 * @returns R2 endpoint URL
 */
function getR2Endpoint(): string {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) {
    throw new Error("R2_ACCOUNT_ID environment variable is not set");
  }
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

/**
 * Initialize R2 S3 client
 * Throws error if required environment variables are missing
 *
 * This is initialized lazily to avoid accessing env vars at module load time
 */
let _r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_r2Client) {
    if (!isR2Configured()) {
      throw new Error(
        "R2 configuration is missing. Please check your environment variables."
      );
    }
    _r2Client = new S3Client({
      region: "auto",
      endpoint: getR2Endpoint(),
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _r2Client;
}
