/**
 * Hook for submitting user feedback
 */

"use client";

import { useState, useCallback } from "react";
import type { UserFeedback } from "@/types/ui-ux";

/**
 * Hook for feedback submission
 *
 * @returns Feedback submission state and functions
 */
export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Submit feedback
   */
  const submitFeedback = useCallback(
    async (feedback: Pick<UserFeedback, "type" | "description" | "userEmail">) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // Prepare feedback data
        const feedbackData: UserFeedback = {
          ...feedback,
          timestamp: Date.now(),
        };

        // Submit to API
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(feedbackData),
        });

        // Try to parse JSON response, handle empty or non-JSON responses
        let responseData: { success?: boolean; message?: string; error?: string } = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const text = await response.text();
            responseData = text ? JSON.parse(text) : {};
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError);
            responseData = {};
          }
        } else {
          // Non-JSON response, try to get text
          try {
            const text = await response.text();
            console.warn("Non-JSON response received:", text);
          } catch (textError) {
            console.error("Failed to read response text:", textError);
          }
        }

        if (!response.ok) {
          // Log the full error for debugging
          console.error("Feedback API error:", {
            status: response.status,
            statusText: response.statusText,
            contentType,
            responseData,
            feedbackData,
          });
          const errorMessage =
            responseData?.message ||
            responseData?.error ||
            `Failed to submit feedback (${response.status} ${response.statusText})`;
          throw new Error(errorMessage);
        }

        // Check if response indicates success
        if (responseData.success !== false) {
          setSuccess(true);
        } else {
          throw new Error(
            responseData.message ||
              responseData.error ||
              "Failed to submit feedback"
          );
        }

        // Reset success state after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        console.error("Feedback submission error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Reset feedback state
   */
  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submitFeedback,
    isLoading,
    error,
    success,
    reset,
  };
}
