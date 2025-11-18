import axios from 'axios';
import { ImageData, PexelsSearchResponse, PexelsPhoto } from './types';

/**
 * Pexels API client
 */
export class PexelsClient {
  private apiKey: string;
  private baseUrl = 'https://api.pexels.com/v1';

  constructor() {
    this.apiKey = process.env.PEXELS_API_KEY!;
    if (!this.apiKey) {
      throw new Error('PEXELS_API_KEY is required');
    }
  }

  /**
   * Search for images with query, pagination support
   * @param query - Search query string
   * @param page - Page number (1-indexed)
   * @param perPage - Results per page (max 80)
   * @returns Raw API response with photos and pagination info
   */
  async search(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<{ photos: PexelsPhoto[]; total: number; totalPages: number }> {
    try {
      const response = await axios.get<PexelsSearchResponse>(
        `${this.baseUrl}/search`,
        {
          params: {
            query: query.trim(),
            per_page: Math.min(perPage, 80), // Pexels max is 80
            page,
          },
          headers: {
            Authorization: this.apiKey,
          },
        }
      );

      if (!response.data.photos || !Array.isArray(response.data.photos)) {
        console.error('Invalid Pexels API response:', response.data);
        return { photos: [], total: 0, totalPages: 0 };
      }

      const totalPages = Math.ceil(
        response.data.total_results / response.data.per_page
      );

      return {
        photos: response.data.photos,
        total: response.data.total_results,
        totalPages,
      };
    } catch (error: any) {
      // Handle rate limiting (429) and other errors
      if (error.response?.status === 429) {
        throw new Error('Pexels rate limit exceeded');
      }
      if (error.response?.status === 401) {
        throw new Error('Pexels API key invalid');
      }
      console.error('Pexels API error:', error);
      throw new Error(`Failed to fetch images from Pexels: ${error.message}`);
    }
  }

  /**
   * Search for popular tech-related images (legacy method)
   * @deprecated Use search() method instead
   */
  async searchImages(count: number = 8): Promise<ImageData[]> {
    try {
      const query = 'software AI technology programming computer';
      const response = await axios.get<PexelsSearchResponse>(
        `${this.baseUrl}/search`,
        {
          params: {
            query,
            per_page: count,
            orientation: 'landscape',
            size: 'large',
          },
          headers: {
            Authorization: this.apiKey,
          },
        }
      );

      if (!response.data.photos || !Array.isArray(response.data.photos)) {
        console.error('Invalid Pexels API response:', response.data);
        return [];
      }

      return response.data.photos.map((photo) => ({
        id: photo.id.toString(),
        url: photo.src.large,
        width: photo.width,
        height: photo.height,
        source: 'pexels' as const,
        author: photo.photographer,
        tags: photo.alt ? [photo.alt] : [],
      }));
    } catch (error) {
      console.error('Pexels API error:', error);
      console.error('Response data:', error.response?.data);
      throw new Error(`Failed to fetch images from Pexels: ${error}`);
    }
  }
}
