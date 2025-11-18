# Quickstart Guide: R2 Images Display

**Feature**: R2 Images Display with Tabbed Buckets  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Prerequisites

- Node.js 20+ installed
- Cloudflare R2 account with three buckets:
  - `bestitconsulting-assets`
  - `juewei-assets`
  - `static-assets`
- R2 API credentials (Access Key ID and Secret Access Key)
- Clerk authentication configured (already set up in project)

## Setup Steps

### 1. Install Dependencies

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner react-intersection-observer react-masonry-css
```

### 2. Configure Environment Variables

Add the following to `.env.local`:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_ACCOUNT_ID=your_cloudflare_account_id

# Optional: Public URL if buckets have public access
# R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**How to get R2 credentials**:
1. Log in to Cloudflare Dashboard
2. Go to R2 → Manage R2 API Tokens
3. Create API token with Read permissions
4. Copy Access Key ID and Secret Access Key
5. Find Account ID in dashboard URL or account settings

### 3. Create R2 Client Library

Create `lib/r2/client.ts`:

```typescript
import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ACCOUNT_ID) {
  throw new Error("Missing R2 environment variables");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKETS = [
  "bestitconsulting-assets",
  "juewei-assets",
  "static-assets",
] as const;

export type R2BucketName = typeof R2_BUCKETS[number];
```

### 4. Create API Routes

#### List Objects API (`app/api/r2/list/route.ts`)

```typescript
import { auth } from "@clerk/nextjs/server";
import { r2Client, R2_BUCKETS } from "@/lib/r2/client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function isImageFile(key: string): boolean {
  const ext = key.toLowerCase().substring(key.lastIndexOf("."));
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
}

export async function GET(req: NextRequest) {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { type: "authentication", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const bucket = searchParams.get("bucket");
  const prefix = searchParams.get("prefix") || "";
  const token = searchParams.get("token") || undefined;
  const maxKeys = parseInt(searchParams.get("maxKeys") || "100");

  // Validate bucket
  if (!bucket || !R2_BUCKETS.includes(bucket as any)) {
    return NextResponse.json(
      { error: { type: "validation", message: "Invalid bucket name" } },
      { status: 400 }
    );
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: "/",
      MaxKeys: maxKeys,
      ContinuationToken: token,
    });

    const response = await r2Client.send(command);

    // Separate folders and files
    const folders =
      response.CommonPrefixes?.map((prefix) => ({
        key: prefix.Prefix!,
        name: prefix.Prefix!.replace(prefix.Prefix || "", "").replace("/", ""),
        size: 0,
        lastModified: new Date(),
        isFolder: true,
        url: null,
        urlExpiresAt: null,
        mimeType: null,
      })) || [];

    const files =
      response.Contents?.filter((obj) => obj.Key && isImageFile(obj.Key)).map(
        async (obj) => {
          // Generate presigned URL
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: obj.Key!,
          });
          const url = await getSignedUrl(r2Client, getObjectCommand, {
            expiresIn: 3600, // 1 hour
          });

          return {
            key: obj.Key!,
            name: obj.Key!.split("/").pop() || obj.Key!,
            size: obj.Size || 0,
            lastModified: obj.LastModified || new Date(),
            isFolder: false,
            url,
            urlExpiresAt: new Date(Date.now() + 3600 * 1000),
            mimeType: null, // Could be extracted from metadata if available
          };
        }
      ) || [];

    const objects = await Promise.all(files);

    return NextResponse.json({
      objects,
      folders,
      hasMore: response.IsTruncated || false,
      nextToken: response.NextContinuationToken || null,
    });
  } catch (error) {
    console.error("R2 list error:", error);
    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: "Failed to list objects",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
```

#### Image URL API (`app/api/r2/image/route.ts`)

```typescript
import { auth } from "@clerk/nextjs/server";
import { r2Client, R2_BUCKETS } from "@/lib/r2/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { type: "authentication", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const bucket = searchParams.get("bucket");
  const key = searchParams.get("key");

  if (!bucket || !R2_BUCKETS.includes(bucket as any)) {
    return NextResponse.json(
      { error: { type: "validation", message: "Invalid bucket name" } },
      { status: 400 }
    );
  }

  if (!key) {
    return NextResponse.json(
      { error: { type: "validation", message: "Missing key parameter" } },
      { status: 400 }
    );
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      url,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("R2 image URL error:", error);
    return NextResponse.json(
      {
        error: {
          type: "server_error",
          message: "Failed to generate image URL",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
```

### 5. Create Main Page

Create `app/r2-images/page.tsx`:

```typescript
import { R2ImageGallery } from "@/components/r2-images/r2-image-gallery";

export default function R2ImagesPage() {
  return <R2ImageGallery />;
}
```

### 6. Create Gallery Component

Create `components/r2-images/r2-image-gallery.tsx` (client component):

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { R2ImageTabs } from "./r2-image-tabs";
import { R2ImageGrid } from "./r2-image-grid";
import { R2ImageMasonry } from "./r2-image-masonry";
import { R2ImageList } from "./r2-image-list";
import { R2FolderNavigation } from "./r2-folder-navigation";
import { R2_BUCKETS } from "@/lib/r2/client";

type DisplayMode = "grid" | "masonry" | "list";

export function R2ImageGallery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bucket = searchParams.get("bucket") || R2_BUCKETS[0];
  const folder = searchParams.get("folder") || "";
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [images, setImages] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch images when bucket or folder changes
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/r2/list?bucket=${bucket}&prefix=${folder}`
        );
        const data = await response.json();
        setImages(data.objects || []);
        setFolders(data.folders || []);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [bucket, folder]);

  const handleTabChange = (newBucket: string) => {
    router.push(`/r2-images?bucket=${newBucket}&folder=`);
  };

  const handleFolderClick = (folderPath: string) => {
    router.push(`/r2-images?bucket=${bucket}&folder=${folderPath}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <R2ImageTabs
        buckets={R2_BUCKETS}
        activeBucket={bucket}
        onTabChange={handleTabChange}
      />
      
      <R2FolderNavigation
        bucket={bucket}
        currentFolder={folder}
        folders={folders}
        onFolderClick={handleFolderClick}
      />

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            {displayMode === "grid" && <R2ImageGrid images={images} />}
            {displayMode === "masonry" && <R2ImageMasonry images={images} />}
            {displayMode === "list" && <R2ImageList images={images} />}
          </>
        )}
      </div>
    </div>
  );
}
```

### 7. Run Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000/r2-images`

## Testing

### Test API Endpoints

```bash
# List objects in bucket (requires authentication)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  "http://localhost:3000/api/r2/list?bucket=bestitconsulting-assets&prefix="

# Get image URL (requires authentication)
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  "http://localhost:3000/api/r2/image?bucket=bestitconsulting-assets&key=images/photo.jpg"
```

### Test UI Components

1. Navigate to `/r2-images`
2. Verify three tabs appear
3. Click tabs to switch buckets
4. Click folders to navigate
5. Test infinite scroll by scrolling down
6. Switch display modes (grid, masonry, list)

## Next Steps

1. Implement infinite scroll with Intersection Observer
2. Add lazy loading for images
3. Implement filter/search functionality
4. Add image modal/lightbox
5. Polish animations with Framer Motion
6. Add loading skeletons
7. Implement error handling UI

## Troubleshooting

### R2 Connection Errors

- Verify environment variables are set correctly
- Check R2 API token has Read permissions
- Verify account ID is correct
- Check network connectivity to Cloudflare

### Authentication Errors

- Ensure Clerk is configured correctly
- Verify middleware is protecting routes
- Check Clerk environment variables

### Image Loading Issues

- Verify presigned URLs are generated correctly
- Check image format is supported (JPEG, PNG, WebP, GIF)
- Verify bucket permissions allow reading objects

## References

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Intersection Observer](https://github.com/thebuilder/react-intersection-observer)

