/**
 * R2 Constants
 *
 * Constants that can be safely imported by both client and server code
 */

import type { R2BucketName } from "@/types/r2";

/**
 * Supported R2 bucket names
 * These are the three buckets configured for this feature
 */
export const R2_BUCKETS: readonly R2BucketName[] = [
  "bestitconsulting-assets",
  "juewei-assets",
  "static-assets",
] as const;

/**
 * Type export for R2 bucket names
 */
export type { R2BucketName };
