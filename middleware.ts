import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Note: Next.js 16 deprecates middleware.ts in favor of proxy.ts
// However, Clerk's clerkMiddleware currently requires default export in middleware.ts
// Keep using middleware.ts until Clerk updates to support proxy.ts
// The deprecation warning can be safely ignored for now
export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public auth routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

