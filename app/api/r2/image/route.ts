/**
 * API Route: Get Image Presigned URL
 * 
 * GET /api/r2/image?bucket={name}&key={path}
 * 
 * Generates a presigned URL for accessing a specific image from an R2 bucket.
 * URLs expire after 1 hour for security.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2/get-object-url";
import { R2_BUCKETS } from "@/lib/r2/constants";
import { isR2Configured } from "@/lib/r2/client";
import type { R2BucketName } from "@/types/r2";

export async function GET(request: NextRequest) {
  // Verify authentication (FR-017)
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: {
            type: "authentication",
            message: "Authentication required. Please sign in.",
            retryable: false,
          },
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      {
        error: {
          type: "authentication",
          message: "Authentication required. Please sign in.",
          retryable: false,
        },
      },
      { status: 401 }
    );
  }

  // Check R2 configuration
  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error: {
          type: "configuration",
          message: "R2 configuration is missing. Please check your environment variables.",
          retryable: false,
        },
      },
      { status: 500 }
    );
  }

  // Extract and validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const bucket = searchParams.get("bucket");
  const key = searchParams.get("key");

  // Validate bucket name
  if (!bucket || !R2_BUCKETS.includes(bucket as R2BucketName)) {
    return NextResponse.json(
      {
        error: {
          type: "validation",
          message: `Invalid bucket name. Must be one of: ${R2_BUCKETS.join(", ")}`,
          retryable: false,
        },
      },
      { status: 400 }
    );
  }

  // Validate key parameter
  if (!key) {
    return NextResponse.json(
      {
        error: {
          type: "validation",
          message: "Missing required parameter: key",
          retryable: false,
        },
      },
      { status: 400 }
    );
  }

  try {
    // Generate presigned URL
    const { url, expiresAt } = await getPresignedUrl(
      bucket as R2BucketName,
      key
    );

    return NextResponse.json({
      url,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("R2 image URL error:", error);
    
    // Check if it's a "not found" error
    if (
      error instanceof Error &&
      (error.message.includes("NoSuchKey") ||
        error.message.includes("not found") ||
        error.message.includes("404"))
    ) {
      return NextResponse.json(
        {
          error: {
            type: "not_found",
            message: "Image not found",
            retryable: false,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: "Failed to generate image URL",
          details: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}

