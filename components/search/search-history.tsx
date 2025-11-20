/**
 * Search History Component
 * 
 * Displays user's recent search history in a dropdown
 */

'use client';

import { Clock, X } from 'lucide-react';
import { useSearchHistory } from '@/lib/hooks/use-search-history';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

/**
 * Props for SearchHistory component
 */
interface SearchHistoryProps {
  /** Callback when a history entry is selected */
  onSelect: (query: string) => void;
  /** Whether history dropdown is visible */
  isVisible: boolean;
  /** Callback to close history */
  onClose: () => void;
}

/**
 * Search History Component
 * 
 * Shows user's recent search history (only for authenticated users)
 */
export function SearchHistory({
  onSelect,
  isVisible,
  onClose,
}: SearchHistoryProps) {
  const { userId } = useAuth();
  const { history, removeFromHistory, clearHistory } = useSearchHistory(userId || undefined);
  
  if (!isVisible || !userId || history.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Recent Searches</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clearHistory();
            onClose();
          }}
          className="h-6 px-2 text-xs"
          aria-label="Clear search history"
        >
          Clear
        </Button>
      </div>
      <div role="listbox" aria-label="Search history">
        {history.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 hover:bg-accent group"
          >
            <button
              type="button"
              onClick={() => {
                onSelect(entry.query);
                onClose();
              }}
              className="flex-1 text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              role="option"
            >
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 truncate">{entry.query}</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(entry.query);
              }}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${entry.query} from history`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

