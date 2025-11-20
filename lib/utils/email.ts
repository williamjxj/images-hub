/**
 * Email utilities for feedback submission
 */

import type { UserFeedback } from '@/types/ui-ux';

/**
 * Capture browser and device information
 */
export function captureBrowserInfo(): UserFeedback['browserInfo'] {
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  return {
    userAgent: navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };
}

/**
 * Capture recent user actions (simplified - can be enhanced with action tracking)
 */
export function captureUserActions(): string[] {
  // This is a simplified implementation
  // In a full implementation, you would track user actions in a store/context
  // and return the most recent ones
  
  if (typeof window === 'undefined') {
    return [];
  }
  
  // For now, return current page path as a basic action
  return [window.location.pathname];
}

/**
 * Format feedback email HTML content
 * 
 * @param feedback Feedback data
 * @returns HTML string for email
 */
export function formatFeedbackEmail(feedback: UserFeedback): string {
  const timestamp = new Date(feedback.timestamp).toLocaleString();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #f4f4f4; padding: 20px; border-bottom: 2px solid #ddd; }
          .content { padding: 20px; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .error-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin-top: 10px; }
          .browser-info { background-color: #f9f9f9; padding: 15px; margin-top: 10px; }
          pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Feedback Submission: ${feedback.type}</h2>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
        </div>
        <div class="content">
          <div class="section">
            <span class="label">Feedback Type:</span>
            <span class="value">${feedback.type}</span>
          </div>
          
          <div class="section">
            <span class="label">Description:</span>
            <div class="value">${feedback.description.replace(/\n/g, '<br>')}</div>
          </div>
          
          <div class="section">
            <span class="label">User:</span>
            <span class="value">
              ${feedback.userId || 'Anonymous'}
              ${feedback.userEmail ? `(${feedback.userEmail})` : ''}
            </span>
          </div>
          
          <div class="section">
            <span class="label">Page URL:</span>
            <span class="value">${feedback.pageUrl}</span>
          </div>
          
          ${feedback.rating ? `
            <div class="section">
              <span class="label">Rating:</span>
              <span class="value">${feedback.rating}</span>
            </div>
          ` : ''}
          
          ${feedback.errorDetails ? `
            <div class="section">
              <span class="label">Error Details:</span>
              <div class="error-details">
                <p><strong>Message:</strong> ${feedback.errorDetails.message}</p>
                ${feedback.errorDetails.stack ? `
                  <p><strong>Stack Trace:</strong></p>
                  <pre>${feedback.errorDetails.stack}</pre>
                ` : ''}
                ${feedback.errorDetails.componentStack ? `
                  <p><strong>Component Stack:</strong></p>
                  <pre>${feedback.errorDetails.componentStack}</pre>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          ${feedback.userActions && feedback.userActions.length > 0 ? `
            <div class="section">
              <span class="label">User Actions:</span>
              <ul class="value">
                ${feedback.userActions.map((action) => `<li>${action}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${feedback.browserInfo ? `
            <div class="section">
              <span class="label">Browser Information:</span>
              <div class="browser-info">
                <p><strong>User Agent:</strong> ${feedback.browserInfo.userAgent}</p>
                <p><strong>Viewport:</strong> ${feedback.browserInfo.viewportWidth} x ${feedback.browserInfo.viewportHeight}</p>
              </div>
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;
}

