"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * Page-specific navigation header matching portrait.so design
 * Clean, minimal navbar with smooth animations
 */
export function PortraitHeader() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      
      const sections = ["hero", "features", "benefits", "faq"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/portrait" },
    { label: "stock images", href: "/images-hub" },
    { label: "Cloudflare Images", href: "/r2-images" },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" 
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/portrait"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {/* Gradient logo like portrait.so */}
            <div className="relative w-8 h-8 rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5 rounded-md">
                <div className="w-full h-full bg-background rounded-md" />
              </div>
            </div>
            <span className="text-lg font-semibold">Image Hub</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = item.href === "/portrait" && activeSection === "hero";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 relative ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

