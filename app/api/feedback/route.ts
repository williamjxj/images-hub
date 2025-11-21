/**
 * Feedback API Route
 *
 * Handles user feedback submissions via email
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatFeedbackEmail } from "@/lib/utils/email";
import type { UserFeedback } from "@/types/ui-ux";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * POST /api/feedback
 *
 * Submits user feedback via email to service@bestitconsulting.ca
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - allow anonymous feedback)
    const { userId } = await auth();

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate feedback data
    const feedback: UserFeedback = {
      type: ["error", "feature-request", "helpful-prompt", "general"].includes(
        body.type
      )
        ? body.type
        : "general",
      userName: body.userName || undefined,
      subject: body.subject || undefined,
      description: body.description || "",
      userId: userId || undefined,
      userEmail: body.userEmail || undefined,
      timestamp: body.timestamp || Date.now(),
    };

    // Validate required fields
    if (!feedback.description || feedback.description.trim() === "") {
      return NextResponse.json(
        { error: "Bad Request", message: "Description is required" },
        { status: 400 }
      );
    }

    // Format email content
    const emailHtml = formatFeedbackEmail(feedback);
    const identifier = feedback.userName || feedback.userEmail || feedback.userId || "Anonymous user";
    const emailSubject = feedback.subject 
      ? `Contact: ${feedback.subject}`
      : `Contact: ${feedback.type} from ${identifier}`;

    // Send email via Resend
    // In development or when RESEND_API_KEY is not configured, log feedback and return success
    const isDevelopment =
      process.env.NODE_ENV === "development" || !process.env.RESEND_API_KEY;

    if (!process.env.RESEND_API_KEY) {
      // In development, log feedback when email service is not configured
      if (isDevelopment) {
        console.error(
          "RESEND_API_KEY is not configured - feedback not sent:",
          JSON.stringify(feedback, null, 2)
        );
      }
      return NextResponse.json(
        {
          success: true,
          message:
            "Feedback logged successfully (email service not configured)",
        },
        { status: 200 }
      );
    }

    try {
      if (!resend) {
        throw new Error("Resend client not initialized - API key missing");
      }

      const emailResult = await resend.emails.send({
        from: "Images Hub <onboarding@resend.dev>",
        to: "service@bestitconsulting.ca",
        subject: emailSubject,
        html: emailHtml,
        reply_to: feedback.userEmail || undefined,
      });

      if (emailResult.error) {
        console.error("Failed to send feedback email:", emailResult.error);
        // Always return success in development, log error in production
        if (isDevelopment) {
          return NextResponse.json(
            {
              success: true,
              message: "Feedback logged (email service error - check console)",
            },
            { status: 200 }
          );
        }
        return NextResponse.json(
          {
            error: "Internal Server Error",
            message: "Failed to send feedback email",
          },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error("Email sending exception:", emailError);
      // Always return success in development, throw in production
      if (isDevelopment) {
        return NextResponse.json(
          {
            success: true,
            message: "Feedback logged (email exception - check console)",
          },
          { status: 200 }
        );
      }
      throw emailError;
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit feedback";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Feedback API error:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
