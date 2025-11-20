/**
 * Feedback API Route
 * 
 * Handles user feedback submissions via email
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { formatFeedbackEmail } from '@/lib/utils/email';
import type { UserFeedback } from '@/types/ui-ux';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const body = await request.json();
    
    // Validate feedback data
    const feedback: UserFeedback = {
      type: body.type || 'general',
      description: body.description || '',
      userId: userId || undefined,
      userEmail: body.userEmail || undefined,
      pageUrl: body.pageUrl || '',
      userActions: body.userActions || [],
      errorDetails: body.errorDetails || undefined,
      browserInfo: body.browserInfo || undefined,
      timestamp: body.timestamp || Date.now(),
      rating: body.rating || undefined,
    };
    
    // Validate required fields
    if (!feedback.description || feedback.description.trim() === '') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Description is required' },
        { status: 400 }
      );
    }
    
    if (!feedback.pageUrl) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Page URL is required' },
        { status: 400 }
      );
    }
    
    // Format email content
    const emailHtml = formatFeedbackEmail(feedback);
    const emailSubject = `Feedback: ${feedback.type} - ${new Date(feedback.timestamp).toLocaleString()}`;
    
    // Send email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    const emailResult = await resend.emails.send({
      from: 'AI Chatbox <noreply@bestitconsulting.ca>',
      to: 'service@bestitconsulting.ca',
      subject: emailSubject,
      html: emailHtml,
      replyTo: feedback.userEmail || undefined,
    });
    
    if (emailResult.error) {
      console.error('Failed to send feedback email:', emailResult.error);
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to send feedback email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Feedback submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to submit feedback',
      },
      { status: 500 }
    );
  }
}

