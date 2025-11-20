import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  // API routes handle their own authentication
  "/api/r2(.*)",
  "/api/feedback(.*)", // Allow anonymous feedback submissions
]);

// Note: Next.js 16 deprecates middleware.ts in favor of proxy.ts
// However, Clerk's clerkMiddleware currently requires default export in middleware.ts
// Keep using middleware.ts until Clerk updates to support proxy.ts
// The deprecation warning can be safely ignored for now
export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  // CRITICAL: Skip static files FIRST - before any auth() calls
  // Check for common static file extensions (case-insensitive)
  const staticFilePattern = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json|woff|woff2|ttf|eot|webmanifest|xml|txt)$/i;
  if (staticFilePattern.test(pathname)) {
    // Return immediately without any Clerk processing
    return NextResponse.next();
  }

  // Skip Next.js internals
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Skip favicon and other common static assets
  if (pathname.includes("favicon") || pathname.includes("android-chrome")) {
    return NextResponse.next();
  }

  // Protect all routes except public auth routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Only match page routes and API routes
     * Explicitly exclude static files by not matching paths with file extensions
     */
    "/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
