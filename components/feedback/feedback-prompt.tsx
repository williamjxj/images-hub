/**
 * Feedback Prompt Component
 *
 * Contextual "Was this helpful?" prompt that appears after key user actions
 */

"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFeedback } from "@/lib/hooks/use-feedback";

/**
 * Props for FeedbackPrompt component
 */
interface FeedbackPromptProps {
  /** Context description of what the user just did */
  context: string;
  /** Callback when feedback is submitted */
  onSubmitted?: () => void;
  /** Callback to dismiss prompt */
  onDismiss?: () => void;
}

/**
 * Feedback Prompt Component
 *
 * Shows a "Was this helpful?" prompt after key user actions
 */
export function FeedbackPrompt({
  context,
  onSubmitted,
  onDismiss,
}: FeedbackPromptProps) {
  const [showForm, setShowForm] = useState(false);
  const { submitFeedback, isLoading } = useFeedback();

  const handleRating = async (rating: "positive" | "negative") => {
    await submitFeedback({
      type: "helpful-prompt",
      description: `User rated "${context}" as ${rating}`,
      rating,
    });

    setShowForm(true);
    onSubmitted?.();
  };

  if (showForm) {
    return (
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Thank you for your feedback!
            </p>
            <p className="text-xs text-muted-foreground">
              Your response helps us improve the experience.
            </p>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Was this helpful?</p>
          <p className="text-xs text-muted-foreground">{context}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRating("positive")}
            disabled={isLoading}
            aria-label="Yes, this was helpful"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRating("negative")}
            disabled={isLoading}
            aria-label="No, this was not helpful"
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            No
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
