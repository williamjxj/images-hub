/**
 * R2 Image Filter Component
 *
 * Provides search and advanced filtering options for images.
 * Includes search by filename, filter by file type, size range, and date range.
 */

"use client";

import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ImageGalleryFilter } from "@/types/r2";

interface R2ImageFilterProps {
  filter: ImageGalleryFilter;
  onFilterChange: (filter: ImageGalleryFilter) => void;
  imageCount?: number;
}

const FILE_TYPES = [
  { value: "jpg", label: "JPEG", category: "image" },
  { value: "jpeg", label: "JPEG", category: "image" },
  { value: "png", label: "PNG", category: "image" },
  { value: "webp", label: "WebP", category: "image" },
  { value: "gif", label: "GIF", category: "image" },
  { value: "mp4", label: "MP4", category: "video" },
  { value: "webm", label: "WebM", category: "video" },
  { value: "mov", label: "MOV", category: "video" },
  { value: "avi", label: "AVI", category: "video" },
  { value: "mkv", label: "MKV", category: "video" },
  { value: "m4v", label: "M4V", category: "video" },
];

export function R2ImageFilter({
  filter,
  onFilterChange,
  imageCount = 0,
}: R2ImageFilterProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filter.search || "");
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(
    filter.fileTypes || []
  );
  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedFileTypes.length > 0;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      ...filter,
      search: value.trim() || undefined,
    });
  };

  const handleFileTypeToggle = (fileType: string) => {
    const newTypes = selectedFileTypes.includes(fileType)
      ? selectedFileTypes.filter((t) => t !== fileType)
      : [...selectedFileTypes, fileType];

    setSelectedFileTypes(newTypes);
    onFilterChange({
      ...filter,
      fileTypes: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFileTypes([]);
    onFilterChange({
      ...filter,
      search: undefined,
      fileTypes: undefined,
    });
  };

  // Avoid Radix Popover hydration mismatches by rendering it only after mount.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 pr-9"
          aria-label="Search images by filename"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => handleSearchChange("")}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Popover */}
      {isMounted ? (
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              className="relative"
              aria-label="Advanced filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center">
                  {selectedFileTypes.length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">File Type</Label>
                <div className="space-y-3">
                  {/* Images */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Images
                    </Label>
                    <div className="space-y-2">
                      {FILE_TYPES.filter((t) => t.category === "image").map(
                        (type) => (
                          <div
                            key={type.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`filter-type-${type.value}`}
                              checked={selectedFileTypes.includes(type.value)}
                              onCheckedChange={() =>
                                handleFileTypeToggle(type.value)
                              }
                            />
                            <Label
                              htmlFor={`filter-type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  {/* Videos */}
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Videos
                    </Label>
                    <div className="space-y-2">
                      {FILE_TYPES.filter((t) => t.category === "video").map(
                        (type) => (
                          <div
                            key={type.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`filter-type-${type.value}`}
                              checked={selectedFileTypes.includes(type.value)}
                              onCheckedChange={() =>
                                handleFileTypeToggle(type.value)
                              }
                            />
                            <Label
                              htmlFor={`filter-type-${type.value}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {type.label}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results count */}
              {imageCount > 0 && (
                <div className="pt-2 border-t text-sm text-muted-foreground">
                  Showing {imageCount} image{imageCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        // SSR-safe placeholder to keep layout stable during hydration
        <Button variant="outline" size="sm" className="relative" disabled>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      )}
    </div>
  );
}
