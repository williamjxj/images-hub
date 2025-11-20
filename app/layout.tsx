import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget/chat-widget";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts/keyboard-shortcuts-provider";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts/keyboard-shortcuts-dialog";
import { SkipLink } from "@/components/accessibility/skip-link";
import { AppLogo } from "@/components/branding/app-logo";
import { BestITLogo } from "@/components/branding/bestit-logo";
import { BestITConsultantsLogo } from "@/components/branding/bestit-consultants-logo";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
              <header className="flex justify-between items-center px-8 py-4 gap-4 h-16 border-b">
                <nav className="flex items-center gap-4 h-full">
                  <Link
                    href="/"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity h-full"
                  >
                    <AppLogo size="sm" showText={false} />
                    <span className="text-sm font-medium hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap">
                      <ImageIcon className="h-4 w-4" />
                      Stock Images
                    </span>
                  </Link>
                </nav>
                <div className="flex items-center gap-4 h-full">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground hidden md:flex h-full">
                    <span>Powered by</span>
                    <BestITLogo size="sm" />
                    <span>&</span>
                    <BestITConsultantsLogo size="sm" />
                  </div>
                  <ThemeToggle />
                  <SignedOut>
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal">
                      <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm px-4 h-10 cursor-pointer hover:bg-[#5a3ae6]">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </header>
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
