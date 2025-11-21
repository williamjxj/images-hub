"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Image as ImageIcon, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLogo } from "@/components/branding/app-logo";
import { BestITLogo } from "@/components/branding/bestit-logo";
import { BestITConsultantsLogo } from "@/components/branding/bestit-consultants-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Main navigation bar matching portrait.so design
 * Clean, minimal navbar with mobile menu support
 */
export function MainNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "/", icon: null },
    { label: "stock images", href: "/stock-images", icon: ImageIcon },
    { label: "Cloudflare Images", href: "/cloudflare-images", icon: Cloud },
  ];

  const isActive = (href: string) => {
    // Home link is active when on root page
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 flex items-center">
              <AppLogo size="sm" showText={false} />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 relative flex items-center gap-1.5 ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent className="h-4 w-4" strokeWidth={2} />
                  )}
                  {item.label}
                  {active && (
                    <motion.span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Powered by section and mobile menu */}
        <div className="flex items-center gap-4">
          {/* Powered by section - Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <BestITLogo size="sm" />
            <span>&</span>
            <BestITConsultantsLogo size="sm" />
          </div>

          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors py-2 ${
                      active
                        ? "text-foreground border-l-2 border-foreground pl-3"
                        : "text-muted-foreground hover:text-foreground pl-3"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent className="h-4 w-4" strokeWidth={2} />
                    )}
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Powered by</span>
                <BestITLogo size="sm" />
                <span>&</span>
                <BestITConsultantsLogo size="sm" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

