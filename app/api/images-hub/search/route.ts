import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { searchImages } from '@/lib/hub/search-aggregator';

/**
 * Unified image search API endpoint
 * 
 * Searches across multiple providers (Unsplash, Pixabay, Pexels) and returns
 * normalized results grouped by provider.
 * 
 * GET /api/images-hub/search?q=query&providers=unsplash,pexels&page=1&per_page=20
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const providersParam = searchParams.get('providers') || 'unsplash,pexels,pixabay';
    const pageParam = searchParams.get('page');
    const perPageParam = searchParams.get('per_page');

    // Validate query
    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Bad Request', message: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Parse providers
    const providerList = providersParam
      .split(',')
      .map((p) => p.trim().toLowerCase())
      .filter((p) => ['unsplash', 'pexels', 'pixabay'].includes(p)) as (
        | 'unsplash'
        | 'pexels'
        | 'pixabay'
      )[];

    if (providerList.length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'At least one provider must be specified',
        },
        { status: 400 }
      );
    }

    // Parse pagination
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const perPage = perPageParam ? parseInt(perPageParam, 10) : 20;

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Page must be a positive integer' },
        { status: 400 }
      );
    }

    if (isNaN(perPage) || perPage < 1 || perPage > 200) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'per_page must be between 1 and 200',
        },
        { status: 400 }
      );
    }

    // Perform search
    const results = await searchImages(query.trim(), providerList, page, perPage);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message:
          error instanceof Error ? error.message : 'Failed to search images',
      },
      { status: 500 }
    );
  }
}

