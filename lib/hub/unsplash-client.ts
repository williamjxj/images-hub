import axios from "axios";
import { UnsplashSearchResponse, UnsplashPhoto } from "./types";

/**
 * Unsplash API client
 */
export class UnsplashClient {
  private accessKey: string;
  private baseUrl = "https://api.unsplash.com";

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY!;
    if (!this.accessKey) {
      throw new Error("UNSPLASH_ACCESS_KEY is required");
    }
  }

  /**
   * Search for images with query, pagination support
   * @param query - Search query string
   * @param page - Page number (1-indexed)
   * @param perPage - Results per page (max 30)
   * @returns Raw API response with photos and pagination info
   */
  async search(
    query: string,
    page: number = 1,
    perPage: number = 20,
    orderBy: "latest" | "oldest" | "popular" | "relevant" = "popular"
  ): Promise<{ photos: UnsplashPhoto[]; total: number; totalPages: number }> {
    try {
      const response = await axios.get<UnsplashSearchResponse>(
        `${this.baseUrl}/search/photos`,
        {
          params: {
            query: query.trim(),
            per_page: Math.min(perPage, 30), // Unsplash max is 30
            page,
            order_by: orderBy,
          },
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.data.results || !Array.isArray(response.data.results)) {
        console.error("Invalid Unsplash API response:", response.data);
        return { photos: [], total: 0, totalPages: 0 };
      }

      return {
        photos: response.data.results,
        total: response.data.total,
        totalPages: response.data.total_pages,
      };
    } catch (error: unknown) {
      // Handle rate limiting (403) and other errors
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 403) {
        throw new Error("Unsplash rate limit exceeded");
      }
      if (axiosError.response?.status === 401) {
        throw new Error("Unsplash API key invalid");
      }
      console.error("Unsplash API error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch images from Unsplash: ${errorMessage}`);
    }
  }
}
