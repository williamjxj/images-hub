/**
 * Custom hook for managing display mode with localStorage persistence
 *
 * Persists the user's display mode preference across sessions.
 */

"use client";

import { useState, useEffect } from "react";
import type { DisplayMode } from "@/types/r2";

const STORAGE_KEY = "r2-images-display-mode";
const DEFAULT_MODE: DisplayMode = "grid";

export function useDisplayMode() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DEFAULT_MODE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (
        saved &&
        (saved === "grid" || saved === "masonry" || saved === "list")
      ) {
        setDisplayMode(saved as DisplayMode);
      }
    } catch (error) {
      console.error("Failed to load display mode from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when mode changes
  const updateDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save display mode to localStorage:", error);
    }
  };

  return {
    displayMode,
    setDisplayMode: updateDisplayMode,
    isLoaded,
  };
}
