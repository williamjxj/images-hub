import { redirect } from "next/navigation";

/**
 * Redirect old /images-hub route to home page
 * 
 * The Stock Images page is now at the root URL (/)
 */
export default function ImagesHubRedirect() {
  redirect("/");
}
