/**
 * Email utilities for feedback submission
 */

import type { UserFeedback } from "@/types/ui-ux";

/**
 * Format feedback email HTML content
 *
 * @param feedback Feedback data
 * @returns HTML string for email
 */
export function formatFeedbackEmail(feedback: UserFeedback): string {
  const timestamp = new Date(feedback.timestamp).toLocaleString();
  const userIdentifier = feedback.userId || "Anonymous user";
  const contactEmail = feedback.userEmail || "Not provided";
  const descriptionHtml = feedback.description
    ? feedback.description.replace(/\n/g, "<br>")
    : "No description supplied.";

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
            <div class="value">${descriptionHtml}</div>
          </div>
          
          <div class="section">
            <span class="label">Login User:</span>
            <span class="value">${userIdentifier}</span>
          </div>

          <div class="section">
            <span class="label">Contact Email:</span>
            <span class="value">${contactEmail}</span>
          </div>
        </div>
      </body>
    </html>
  `;
}
