/**
 * Image Grid Component for Images Hub
 *
 * Displays images in a masonry/waterfall layout grouped by provider
 */

"use client";

import { ImagesHubItem } from "./images-hub-item";
import type { ProviderResult, ImageResult } from "@/lib/hub/types";

interface ImagesHubGridProps {
  providers: ProviderResult[];
  onImageClick?: (image: ImageResult) => void;
}

const PROVIDER_LABELS = {
  unsplash: "Unsplash Results",
  pexels: "Pexels Results",
  pixabay: "Pixabay Results",
};

export function ImagesHubGrid({ providers, onImageClick }: ImagesHubGridProps) {
  // Filter to providers that have images or errors
  const activeProviders = providers.filter(
    (p) => p.images.length > 0 || p.error !== null
  );

  if (activeProviders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8" role="main" aria-label="Image search results">
      {activeProviders.map((provider) => (
        <div key={provider.provider} className="space-y-4">
          {/* Provider Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {PROVIDER_LABELS[provider.provider]}
              {provider.total > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({provider.images.length} of {provider.total})
                </span>
              )}
            </h2>
            {provider.error && (
              <span className="text-sm text-destructive" role="alert">
                {provider.error}
              </span>
            )}
          </div>

          {/* Masonry Grid */}
          {provider.images.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {provider.images.map((image, index) => (
                <div
                  key={`${provider.provider}-${image.id}-${index}`}
                  className="break-inside-avoid mb-4 w-full"
                >
                  <ImagesHubItem
                    image={image}
                    onClick={() => onImageClick?.(image)}
                  />
                </div>
              ))}
            </div>
          ) : provider.error ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{provider.error}</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
