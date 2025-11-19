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
import { ChatWidget } from "@/components/chat-widget/chat-widget";
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
          <header className="flex justify-between items-center p-4 gap-4 h-16 border-b">
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:underline">
            Stock Images
          </Link>
        </nav>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground hidden md:block">
                Powered by{' '}
                <a
                  href="https://www.bestitconsulting.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Best IT Consulting
                </a>
                {' & '}
                <a
                  href="https://www.bestitconsultants.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Best IT Consultants
                </a>
              </div>
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
          {children}
          <ChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
