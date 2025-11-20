/**
 * Error Display Component for Images Hub
 * 
 * Displays error messages with retry functionality
 */

"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorReportButton } from "@/components/feedback/error-report-button";

interface ImagesHubErrorProps {
  message: string;
  onRetry?: () => void;
}

export function ImagesHubError({ message, onRetry }: ImagesHubErrorProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-1">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Retry
              </Button>
            )}
            <ErrorReportButton errorMessage={message} />
          </div>
        </div>
      </div>
    </Card>
  );
}

