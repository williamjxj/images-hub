/**
 * Animated Text Components using GSAP
 *
 * Various text animation effects for dynamic content
 */

"use client";

import { useEffect, useRef } from "react";
import {
  animateTextReveal,
  animateTypingText,
  animateFadeIn,
} from "@/lib/utils/animations";
import { cn } from "@/lib/utils";

/**
 * Props for AnimatedText component
 */
interface AnimatedTextProps {
  /** Text content to animate */
  children: string;
  /** Animation type */
  animation?: "reveal" | "typing" | "fade";
  /** Animation delay in seconds */
  delay?: number;
  /** Typing speed (for typing animation) */
  typingSpeed?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated Text Component
 *
 * Animates text using GSAP with various effects
 */
export function AnimatedText({
  children,
  animation = "reveal",
  delay = 0,
  typingSpeed = 0.05,
  className,
}: AnimatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    let animationInstance: ReturnType<typeof animateTextReveal> | ReturnType<typeof animateTypingText> | ReturnType<typeof animateFadeIn> | null = null;

    switch (animation) {
      case "typing":
        animationInstance = animateTypingText(
          textRef.current,
          children,
          typingSpeed
        );
        break;
      case "fade":
        animationInstance = animateFadeIn(textRef.current, 0.6);
        break;
      case "reveal":
      default:
        animationInstance = animateTextReveal(textRef.current, delay);
        break;
    }

    return () => {
      if (animationInstance && animationInstance.kill) {
        animationInstance.kill();
      }
    };
  }, [children, animation, delay, typingSpeed]);

  return (
    <div ref={textRef} className={cn("inline-block", className)}>
      {animation === "typing" ? "" : children}
    </div>
  );
}
