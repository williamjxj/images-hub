import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ImagesHubGallery } from "@/components/images-hub/images-hub-gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Image Search Hub",
  description: "Search for images across Unsplash, Pixabay, and Pexels",
};

/**
 * Home Page - Stock Images
 *
 * Requires authentication - redirects to sign-in if not authenticated
 */
export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ImagesHubGallery />;
}
