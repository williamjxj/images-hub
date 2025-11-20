/**
 * API Route: List R2 Objects
 *
 * GET /api/r2/list?bucket={name}&prefix={path}&token={cursor}&maxKeys={limit}
 *
 * Lists objects (images and folders) in a specified R2 bucket with optional folder path.
 * Supports pagination via continuation token for infinite scroll.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { listObjects } from "@/lib/r2/list-objects";
import { R2_BUCKETS } from "@/lib/r2/constants";
import { isR2Configured } from "@/lib/r2/client";
import { getPresignedUrl } from "@/lib/r2/get-object-url";
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
          message:
            "R2 configuration is missing. Please check your environment variables.",
          retryable: false,
        },
      },
      { status: 500 }
    );
  }

  // Extract and validate query parameters
  const searchParams = request.nextUrl.searchParams;
  const bucket = searchParams.get("bucket");
  const prefix = searchParams.get("prefix") || "";
  const token = searchParams.get("token") || undefined;
  const maxKeys = parseInt(searchParams.get("maxKeys") || "100");

  // Validate bucket name (FR-012, FR-018)
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

  try {
    // List objects from R2
    const response = await listObjects(
      bucket as R2BucketName,
      prefix,
      token,
      maxKeys
    );

    // Generate presigned URLs for image objects
    const objectsWithUrls = await Promise.all(
      response.objects.map(async (obj) => {
        if (obj.isFolder) {
          return obj;
        }
        try {
          const { url, expiresAt } = await getPresignedUrl(
            bucket as R2BucketName,
            obj.key
          );
          return {
            ...obj,
            url,
            urlExpiresAt: expiresAt,
          };
        } catch (error) {
          console.error(`Error generating URL for ${obj.key}:`, error);
          // Return object without URL if presigned URL generation fails
          return obj;
        }
      })
    );

    return NextResponse.json({
      objects: objectsWithUrls,
      folders: response.folders,
      hasMore: response.hasMore,
      nextToken: response.nextToken,
    });
  } catch (error) {
    console.error("R2 list error:", error);
    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: "Failed to list objects from R2",
          details: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
}
