import axios from 'axios';
import { ImageData, PixabaySearchResponse, PixabayHit } from './types';

/**
 * Pixabay API client
 */
export class PixabayClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PIXABAY_API_KEY!;
    this.baseUrl = process.env.PIXABAY_URL || 'https://pixabay.com/api/';
    
    if (!this.apiKey) {
      throw new Error('PIXABAY_API_KEY is required');
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
          image_type: 'photo',
        },
      });

      if (!response.data.hits || !Array.isArray(response.data.hits)) {
        console.error('Invalid Pixabay API response:', response.data);
        return { hits: [], total: 0, totalPages: 0 };
      }

      const totalPages = Math.ceil(response.data.totalHits / perPage);

      return {
        hits: response.data.hits,
        total: response.data.totalHits,
        totalPages,
      };
    } catch (error: any) {
      // Handle rate limiting (429) and other errors
      if (error.response?.status === 429) {
        throw new Error('Pixabay rate limit exceeded');
      }
      if (error.response?.status === 400) {
        throw new Error('Pixabay API key invalid or query error');
      }
      console.error('Pixabay API error:', error);
      throw new Error(`Failed to fetch images from Pixabay: ${error.message}`);
    }
  }

  /**
   * Search for popular tech-related images (legacy method)
   * @deprecated Use search() method instead
   */
  async searchImages(count: number = 8): Promise<ImageData[]> {
    try {
      const query = 'software AI technology programming computer';
      const response = await axios.get<PixabaySearchResponse>(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          per_page: count,
          order: 'popular',
          orientation: 'horizontal',
          image_type: 'photo',
          min_width: 1280,
          min_height: 720,
        },
      });

      if (!response.data.hits || !Array.isArray(response.data.hits)) {
        console.error('Invalid Pixabay API response:', response.data);
        return [];
      }

      return response.data.hits.map((hit) => ({
        id: hit.id.toString(),
        url: hit.largeImageURL || hit.webformatURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        source: 'pixabay' as const,
        author: hit.user,
        tags: hit.tags.split(', '),
      }));
    } catch (error) {
      console.error('Pixabay API error:', error);
      console.error('Response data:', error.response?.data);
      throw new Error(`Failed to fetch images from Pixabay: ${error}`);
    }
  }
}
