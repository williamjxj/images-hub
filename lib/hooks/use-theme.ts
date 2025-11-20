/**
 * Hook wrapper for next-themes theme management
 */

'use client';

import { useTheme as useNextThemes } from 'next-themes';
import type { ThemePreference } from '@/types/ui-ux';

/**
 * Hook for theme management
 * 
 * Wraps next-themes useTheme hook with our type definitions
 * 
 * @returns Theme state and control functions
 */
export function useTheme(): {
  theme: ThemePreference['theme'];
  resolvedTheme: ThemePreference['resolvedTheme'];
  setTheme: (theme: ThemePreference['theme']) => void;
  systemTheme: 'light' | 'dark' | undefined;
} {
  const { theme, resolvedTheme, setTheme, systemTheme } = useNextThemes();
  
  return {
    theme: (theme as ThemePreference['theme']) || 'system',
    resolvedTheme: (resolvedTheme as ThemePreference['resolvedTheme']) || undefined,
    setTheme: (newTheme: ThemePreference['theme']) => {
      setTheme(newTheme);
    },
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
  };
}

