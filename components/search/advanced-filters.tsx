/**
 * Advanced Filters Component
 * 
 * Provides advanced filtering options for image search (orientation, color, size)
 */

'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Filter options
 */
export interface AdvancedFilters {
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Props for AdvancedFilters component
 */
interface AdvancedFiltersProps {
  /** Current filter values */
  filters: AdvancedFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: AdvancedFilters) => void;
}

/**
 * Advanced Filters Component
 * 
 * Allows users to filter search results by orientation, color, and size
 */
export function AdvancedFilters({
  filters,
  onFiltersChange,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasActiveFilters =
    filters.orientation || filters.color || filters.size;
  
  const handleFilterChange = (key: keyof AdvancedFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };
  
  const clearFilters = () => {
    onFiltersChange({});
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          aria-label="Advanced filters"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-background/20 rounded">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Advanced Filters</h3>
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
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={filters.orientation || ''}
                onValueChange={(value) =>
                  handleFilterChange('orientation', value || undefined)
                }
              >
                <SelectTrigger id="orientation">
                  <SelectValue placeholder="Any orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any orientation</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={filters.color || ''}
                onValueChange={(value) =>
                  handleFilterChange('color', value || undefined)
                }
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any color</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select
                value={filters.size || ''}
                onValueChange={(value) =>
                  handleFilterChange('size', value || undefined)
                }
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any size</SelectItem>
                  <SelectItem value="small">Small (&lt; 1MP)</SelectItem>
                  <SelectItem value="medium">Medium (1-4MP)</SelectItem>
                  <SelectItem value="large">Large (&gt; 4MP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.orientation && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded">
                  {filters.orientation}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('orientation', undefined)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${filters.orientation} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.color && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded">
                  {filters.color}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('color', undefined)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${filters.color} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.size && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent rounded">
                  {filters.size}
                  <button
                    type="button"
                    onClick={() => handleFilterChange('size', undefined)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${filters.size} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

