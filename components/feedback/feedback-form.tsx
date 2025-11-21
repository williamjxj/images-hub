/**
 * Contact Form Component
 *
 * Unified contact form for submitting user inquiries and feedback
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFeedback } from "@/lib/hooks/use-feedback";
import type { UserFeedback } from "@/types/ui-ux";

/**
 * Props for ContactForm component
 */
interface ContactFormProps {
  /** Initial feedback type */
  initialType?: UserFeedback["type"];
  /** Initial description (for error reports) */
  initialDescription?: string;
  /** Callback when feedback is submitted successfully */
  onSuccess?: () => void;
  /** Callback to close form */
  onClose?: () => void;
}

/**
 * Contact Form Component
 */
export function FeedbackForm({
  initialType = "general",
  initialDescription = "",
  onSuccess,
  onClose,
}: ContactFormProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(initialDescription);
  const { user } = useUser();

  // Get default name from user's username or full name
  const defaultName = useMemo(() => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return "";
  }, [user]);

  // Get default email from user's login email
  const defaultEmail = useMemo(
    () =>
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      "",
    [user]
  );

  // Initialize form state with defaults
  const [userName, setUserName] = useState(() => defaultName);
  const [userEmail, setUserEmail] = useState(() => defaultEmail);
  const nameInitializedRef = useRef(!!defaultName);
  const emailInitializedRef = useRef(!!defaultEmail);

  const { submitFeedback, isLoading, error, success } = useFeedback();

  // Update name when user object loads
  useEffect(() => {
    if (!nameInitializedRef.current && defaultName) {
      nameInitializedRef.current = true;
      const timeoutId = setTimeout(() => {
        setUserName(defaultName);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [defaultName]);

  // Update email when user object loads
  useEffect(() => {
    if (!emailInitializedRef.current && defaultEmail) {
      emailInitializedRef.current = true;
      const timeoutId = setTimeout(() => {
        setUserEmail(defaultEmail);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    await submitFeedback({
      type: initialType,
      userName: userName.trim() || undefined,
      subject: subject.trim() || undefined,
      description: message.trim(),
      userEmail: userEmail.trim() || undefined,
    });

    if (success) {
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Reset form
        setSubject("");
        setMessage("");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder={defaultName ? undefined : "Your name"}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is this regarding?"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder={
            defaultEmail ? undefined : "your.email@example.com"
          }
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          Message
          <span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help you..."
          rows={6}
          required
          disabled={isLoading}
          className="resize-none"
        />
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
          <span>Thank you! Your message has been sent. We&apos;ll get back to you soon.</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
