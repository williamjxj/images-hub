/**
 * Chat Skeleton Component
 * 
 * Loading placeholder for chat messages
 */

'use client';

import { cn } from '@/lib/utils';

/**
 * Props for ChatSkeleton component
 */
interface ChatSkeletonProps {
  /** Number of skeleton messages to display */
  count?: number;
}

/**
 * Chat Skeleton Component
 * 
 * Displays skeleton loading placeholders for chat messages
 */
export function ChatSkeleton({ count = 3 }: ChatSkeletonProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'flex gap-3',
            index % 2 === 0 ? 'justify-start' : 'justify-end'
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-3 space-y-2',
              index % 2 === 0
                ? 'bg-muted'
                : 'bg-primary/10'
            )}
          >
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

