/**
 * Fade Transition Components
 * 
 * CSS-based fade animations for smooth transitions
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for FadeIn component
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Fade In Component
 * 
 * Fades in content using CSS animations
 */
export function FadeIn({ children, delay = 0, duration = 0.3, className }: FadeInProps) {
  return (
    <div
      className={cn('animate-fade-in', className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Props for FadeOut component
 */
interface FadeOutProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Fade Out Component
 * 
 * Fades out content using CSS animations
 */
export function FadeOut({ children, delay = 0, duration = 0.3, className }: FadeOutProps) {
  return (
    <div
      className={cn('animate-fade-out', className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  );
}

