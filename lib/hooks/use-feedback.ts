/**
 * Hook for submitting user feedback
 */

'use client';

import { useState, useCallback } from 'react';
import { captureBrowserInfo, captureUserActions, formatFeedbackEmail } from '@/lib/utils/email';
import type { UserFeedback } from '@/types/ui-ux';

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
    async (feedback: Omit<UserFeedback, 'pageUrl' | 'timestamp' | 'browserInfo' | 'userActions'>) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      try {
        // Capture context
        const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
        const browserInfo = captureBrowserInfo();
        const userActions = captureUserActions();
        
        // Prepare feedback data
        const feedbackData: UserFeedback = {
          ...feedback,
          pageUrl,
          timestamp: Date.now(),
          browserInfo,
          userActions,
        };
        
        // Submit to API
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to submit feedback');
        }
        
        setSuccess(true);
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        console.error('Feedback submission error:', err);
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

