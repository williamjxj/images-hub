/**
 * Theme Provider Component
 *
 * Wraps next-themes ThemeProvider with app-specific configuration
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme */
  defaultTheme?: "light" | "dark" | "system";
  /** Whether to enable system theme detection */
  enableSystem?: boolean;
  /** Attribute name for theme class */
  attribute?: string;
  /** Whether to disable transition on theme change */
  disableTransitionOnChange?: boolean;
}

/**
 * Theme Provider Component
 *
 * Provides theme context for the application using next-themes
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  attribute = "class",
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}
