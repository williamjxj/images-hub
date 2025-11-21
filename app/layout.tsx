import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ChatWidget } from "@/components/chat-widget/chat-widget";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts/keyboard-shortcuts-provider";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts/keyboard-shortcuts-dialog";
import { SkipLink } from "@/components/accessibility/skip-link";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MainNavbar } from "@/components/navbar/main-navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Image Search Hub",
  description: "Search for images across Unsplash, Pixabay, and Pexels",
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicon_io/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider>
            <KeyboardShortcutsProvider>
              <SkipLink />
              <MainNavbar />
              <main id="main-content">{children}</main>
              <ChatWidget />
              <KeyboardShortcutsDialog />
            </KeyboardShortcutsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
