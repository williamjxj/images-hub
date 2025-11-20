/**
 * Error Report Button Component
 * 
 * Button that opens feedback form for error reporting
 */

'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedbackForm } from './feedback-form';
import type { UserFeedback } from '@/types/ui-ux';

/**
 * Props for ErrorReportButton component
 */
interface ErrorReportButtonProps {
  /** Error details to include in report */
  errorDetails?: UserFeedback['errorDetails'];
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Error Report Button Component
 * 
 * Opens a dialog with feedback form pre-filled for error reporting
 */
export function ErrorReportButton({
  errorDetails,
  errorMessage,
}: ErrorReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Report Error
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Error</DialogTitle>
        </DialogHeader>
        <FeedbackForm
          initialType="error"
          initialDescription={errorMessage || ''}
          errorDetails={errorDetails}
          onSuccess={() => setIsOpen(false)}
          onClose={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

