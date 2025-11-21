/**
 * R2 Images Display Page
 *
 * Server component that handles authentication and renders the R2 image gallery.
 * Requires authentication - redirects to sign-in if not authenticated.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { R2ImageGallery } from "@/components/r2-images/r2-image-gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloudflare Images",
  description: "Browse and view images from Cloudflare R2 buckets",
};

export default async function R2ImagesPage() {
  // Verify authentication (FR-017)
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <R2ImageGallery />;
}
