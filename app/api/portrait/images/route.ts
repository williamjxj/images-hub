import { NextRequest, NextResponse } from "next/server";
import { UnsplashClient } from "@/lib/hub/unsplash-client";

/**
 * API route to fetch images for portrait page
 * Fetches random images from Unsplash for parallax gallery
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "beautiful photography portrait nature science";
    const count = parseInt(searchParams.get("count") || "9", 10);

    const unsplashClient = new UnsplashClient();
    // Use popular ordering for better quality, more curated images
    const result = await unsplashClient.search(query, 1, count, "popular");

    // Return image URLs and metadata
    const images = result.photos.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.small,
      full: photo.urls.full,
      width: photo.width,
      height: photo.height,
      author: photo.user.name,
      authorUrl: photo.user.links.html,
      description: photo.description || photo.alt_description || "",
    }));

    return NextResponse.json({ images, total: result.total });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images", images: [] },
      { status: 500 }
    );
  }
}

