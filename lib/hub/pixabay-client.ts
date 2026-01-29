import axios from "axios";
import { PixabaySearchResponse, PixabayHit } from "./types";

/**
 * Pixabay API client
 */
export class PixabayClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY!;
    this.baseUrl = process.env.PIXABAY_URL || "https://pixabay.com/api/";

    if (!this.apiKey) {
      throw new Error("PIXABAY_API_KEY is required");
    }
  }

  /**
   * Search for images with query, pagination support
   * @param query - Search query string
   * @param page - Page number (1-indexed)
   * @param perPage - Results per page (max 200)
   * @returns Raw API response with hits and pagination info
   */
  async search(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ hits: PixabayHit[]; total: number; totalPages: number }> {
    try {
      const response = await axios.get<PixabaySearchResponse>(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query.trim(),
          per_page: Math.min(perPage, 200), // Pixabay max is 200
          page,
          image_type: "photo",
        },
      });

      if (!response.data.hits || !Array.isArray(response.data.hits)) {
        console.error("Invalid Pixabay API response:", response.data);
        return { hits: [], total: 0, totalPages: 0 };
      }

      const totalPages = Math.ceil(response.data.totalHits / perPage);

      return {
        hits: response.data.hits,
        total: response.data.totalHits,
        totalPages,
      };
    } catch (error: unknown) {
      // Handle rate limiting (429) and other errors
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 429) {
        throw new Error("Pixabay rate limit exceeded");
      }
      if (axiosError.response?.status === 400) {
        throw new Error("Pixabay API key invalid or query error");
      }
      console.error("Pixabay API error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch images from Pixabay: ${errorMessage}`);
    }
  }
}
