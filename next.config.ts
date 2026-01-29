import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    // Reduce dev-server noise from frequent R2 folder/image listing requests.
    // This only affects development logging, not production builds.
    incomingRequests: {
      ignore: [/\/api\/r2\/list/],
    },
  },
  images: {
    remotePatterns: [
      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Pexels - images are served from images.pexels.com
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      // Pixabay - images are served from cdn.pixabay.com or pixabay.com
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
      },
      {
        protocol: "https",
        hostname: "**.pixabay.com",
      },
    ],
  },
};

export default nextConfig;
