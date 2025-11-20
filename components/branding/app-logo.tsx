/**
 * Application Logo Component
 *
 * Main application logo/branding
 */

"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Props for AppLogo component
 */
interface AppLogoProps {
  /** Logo size */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show text alongside logo */
  showText?: boolean;
}

/**
 * App Logo Component
 *
 * Displays the application logo
 */
export function AppLogo({
  size = "md",
  className,
  showText = false,
}: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2 h-full", className)}>
      <Image
        src="/logo.png"
        alt="Stock Image Search Hub"
        width={200}
        height={64}
        className="object-contain h-full w-auto"
        style={{ height: "100%" }}
        priority
      />
      {showText && (
        <span
          className={cn(
            "font-semibold",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}
        >
          Stock Image Hub
        </span>
      )}
    </div>
  );
}
