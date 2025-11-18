import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ImagesHubGallery } from "@/components/images-hub/images-hub-gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Image Search Hub",
  description: "Search for images across Unsplash, Pixabay, and Pexels",
};

/**
 * Images Hub Page
 * 
 * Requires authentication - redirects to sign-in if not authenticated
 */
export default async function ImagesHubPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ImagesHubGallery />;
}

