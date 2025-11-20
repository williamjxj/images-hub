/**
 * Feedback Form Component
 * 
 * Form for submitting user feedback (error reports, feature requests, general feedback)
 */

'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFeedback } from '@/lib/hooks/use-feedback';
import type { UserFeedback } from '@/types/ui-ux';

/**
 * Props for FeedbackForm component
 */
interface FeedbackFormProps {
  /** Initial feedback type */
  initialType?: UserFeedback['type'];
  /** Initial description (for error reports) */
  initialDescription?: string;
  /** Optional error details */
  errorDetails?: UserFeedback['errorDetails'];
  /** Callback when feedback is submitted successfully */
  onSuccess?: () => void;
  /** Callback to close form */
  onClose?: () => void;
}

/**
 * Feedback Form Component
 */
export function FeedbackForm({
  initialType = 'general',
  initialDescription = '',
  errorDetails,
  onSuccess,
  onClose,
}: FeedbackFormProps) {
  const [type, setType] = useState<UserFeedback['type']>(initialType);
  const [description, setDescription] = useState(initialDescription);
  const [userEmail, setUserEmail] = useState('');
  
  const { submitFeedback, isLoading, error, success } = useFeedback();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      return;
    }
    
    await submitFeedback({
      type,
      description: description.trim(),
      userEmail: userEmail.trim() || undefined,
      errorDetails,
    });
    
    if (success) {
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feedback-type">Feedback Type</Label>
        <Select value={type} onValueChange={(value) => setType(value as UserFeedback['type'])}>
          <SelectTrigger id="feedback-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Feedback</SelectItem>
            <SelectItem value="feature-request">Feature Request</SelectItem>
            <SelectItem value="error">Error Report</SelectItem>
            <SelectItem value="helpful-prompt">Helpful Prompt Response</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="feedback-description">
          {type === 'error' ? 'Error Description' : 'Description'}
          <span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="feedback-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'error'
              ? 'Describe what went wrong...'
              : type === 'feature-request'
              ? 'Describe the feature you would like to see...'
              : 'Share your feedback...'
          }
          rows={6}
          required
          disabled={isLoading}
          className="resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="feedback-email">Email (Optional)</Label>
        <input
          id="feedback-email"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="your.email@example.com"
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground">
          We'll only use this to follow up if needed
        </p>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-800 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>Thank you! Your feedback has been submitted.</span>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !description.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

