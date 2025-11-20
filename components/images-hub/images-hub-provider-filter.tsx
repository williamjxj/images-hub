/**
 * Provider Filter Component for Images Hub
 *
 * Allows users to select which providers to search (Unsplash, Pixabay, Pexels)
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ImagesHubProviderFilterProps {
  providers: ("unsplash" | "pexels" | "pixabay")[];
  onChange: (providers: ("unsplash" | "pexels" | "pixabay")[]) => void;
  disabled?: boolean;
}

const PROVIDER_LABELS = {
  unsplash: "Unsplash",
  pexels: "Pexels",
  pixabay: "Pixabay",
};

export function ImagesHubProviderFilter({
  providers,
  onChange,
  disabled = false,
}: ImagesHubProviderFilterProps) {
  const handleProviderToggle = (
    provider: "unsplash" | "pexels" | "pixabay"
  ) => {
    if (disabled) return;

    if (providers.includes(provider)) {
      // Don't allow deselecting all providers
      if (providers.length > 1) {
        onChange(providers.filter((p) => p !== provider));
      }
    } else {
      onChange([...providers, provider]);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Search Providers</Label>
        <div className="flex flex-wrap gap-4">
          {(["unsplash", "pexels", "pixabay"] as const).map((provider) => (
            <div key={provider} className="flex items-center space-x-2">
              <Checkbox
                id={`provider-${provider}`}
                checked={providers.includes(provider)}
                onCheckedChange={() => handleProviderToggle(provider)}
                disabled={
                  disabled ||
                  (providers.length === 1 && providers.includes(provider))
                }
                aria-label={`Include ${PROVIDER_LABELS[provider]} in search`}
              />
              <Label
                htmlFor={`provider-${provider}`}
                className="text-sm font-normal cursor-pointer"
              >
                {PROVIDER_LABELS[provider]}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
