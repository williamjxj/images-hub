/**
 * R2 Display Mode Selector Component
 * 
 * Allows users to switch between grid, masonry, and list display modes.
 */

"use client";

import { Grid3x3, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DisplayMode } from "@/types/r2";

interface R2DisplayModeSelectorProps {
  mode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
}

export function R2DisplayModeSelector({
  mode,
  onModeChange,
}: R2DisplayModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mode === "grid" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("grid")}
        className="flex items-center gap-2"
        aria-label="Grid view"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={mode === "masonry" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("masonry")}
        className="flex items-center gap-2"
        aria-label="Masonry view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Masonry</span>
      </Button>
      <Button
        variant={mode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("list")}
        className="flex items-center gap-2"
        aria-label="List view"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
    </div>
  );
}

