"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Particles } from "@/components/ui/particles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Hero section component matching portrait.so design
 * Features: Gradient text animation, floating image cards, input field
 */
export function PortraitHero() {
  const prefersReducedMotion = useReducedMotion();
  const [images, setImages] = useState<Array<{ url: string; id: string }>>([]);
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Image providers to rotate through in the carousel
  const providers = [
    "unsplash",
    "pexels",
    "pixabay",
    "cloudflare",
  ];

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform values for parallax - must be called unconditionally
  const topLeftX = useTransform(x, (v) => v * -20);
  const topLeftY = useTransform(y, (v) => v * -20);
  const topRightX = useTransform(x, (v) => v * 20);
  const topRightY = useTransform(y, (v) => v * -15);
  const bottomLeftX = useTransform(x, (v) => v * -15);
  const bottomLeftY = useTransform(y, (v) => v * 20);

  // Fetch images for floating cards - beautiful, high-quality images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Use specific curated queries that return high-quality images
        const queries = [
          "woman portrait professional photography",
          "nature landscape beautiful scenery",
          "hi-tech technology"
        ];
        
        const imagePromises = queries.map(query =>
          fetch(`/api/portrait/images?query=${encodeURIComponent(query)}&count=3`)
            .then(res => res.json())
            .then(data => data.images?.[0] || null)
            .catch(() => null)
        );
        
        const fetchedImages = await Promise.all(imagePromises);
        const validImages = fetchedImages.filter(img => img !== null);
        
        if (validImages.length >= 3) {
          setImages(validImages);
        } else if (validImages.length > 0) {
          // If we don't have 3, try a fallback query
          const fallback = await fetch("/api/portrait/images?query=portrait photography&count=3")
            .then(res => res.json())
            .then(data => data.images?.slice(0, 3 - validImages.length) || [])
            .catch(() => []);
          setImages([...validImages, ...fallback].slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    fetchImages();
  }, []);

  // Rotate providers carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProviderIndex((prev) => (prev + 1) % providers.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [providers.length]);

  // Mouse movement parallax effect (disabled for reduced motion)
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set((e.clientX - centerX) * 0.01);
      mouseY.set((e.clientY - centerY) * 0.01);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReducedMotion]);

  const handleCTAClick = () => {
    setIsContactDialogOpen(true);
  };

  // Headline with gradient on "forever"
  const headlineParts = [
    { text: "Your ", gradient: false },
    { text: "forever", gradient: true },
    { text: " space for all your visual creations", gradient: false },
  ];

  return (
    <motion.section
      ref={containerRef}
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 py-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8 }}
    >
      {/* Soft gradient background with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/40 via-purple-50/20 to-blue-50/40 dark:from-pink-950/15 dark:via-purple-950/15 dark:to-blue-950/15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(219,39,119,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(219,39,119,0.05),transparent_50%)]" />
      
      {/* Particle background effect */}
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#A97CF8"
        size={1.5}
        refresh
      />

      {/* Floating image cards with enhanced animations */}
      {images.length > 0 && (
        <>
          {/* Top-left image */}
          <motion.div
            className="absolute top-20 left-4 md:left-20 w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10 dark:border-white/5"
            style={{
              x: topLeftX,
              y: topLeftY,
              rotate: -5,
            }}
            initial={{ opacity: 0, scale: 0.8, x: -100, y: -50 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, z: 20 }}
          >
            <Image
              src={images[0]?.url || "/placeholder.jpg"}
              alt="Floating image 1"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 192px, 256px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>

          {/* Top-right image */}
          <motion.div
            className="absolute top-32 right-4 md:right-20 w-56 h-40 md:w-72 md:h-52 rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10 dark:border-white/5"
            style={{
              x: topRightX,
              y: topRightY,
              rotate: 8,
            }}
            initial={{ opacity: 0, scale: 0.8, x: 100, y: -50 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, z: 20 }}
          >
            <Image
              src={images[1]?.url || "/placeholder.jpg"}
              alt="Floating image 2"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 224px, 288px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>

          {/* Bottom-left image */}
          <motion.div
            className="absolute bottom-20 left-8 md:left-32 w-52 h-44 md:w-68 md:h-56 rounded-2xl overflow-hidden shadow-2xl z-10 border border-white/10 dark:border-white/5"
            style={{
              x: bottomLeftX,
              y: bottomLeftY,
              rotate: -8,
            }}
            initial={{ opacity: 0, scale: 0.8, x: -80, y: 50 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, z: 20 }}
          >
            <Image
              src={images[2]?.url || "/placeholder.jpg"}
              alt="Floating image 3"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 208px, 272px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>
        </>
      )}

      {/* Main content */}
      <div className="container mx-auto max-w-4xl relative z-20">
        {/* Animated headline with gradient text */}
        <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
          {headlineParts.map((part, index) => (
            <motion.span
              key={index}
              className="inline-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : {
                delay: index * 0.12,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {part.gradient ? (
                <span
                  className="bg-gradient-to-r from-blue-600 via-cyan-500 via-emerald-400 via-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-gradient"
                  style={{
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {part.text}
                </span>
              ) : (
                <span className="text-foreground">{part.text}</span>
              )}
            </motion.span>
          ))}
        </h1>

        {/* Animated subheadline */}
        <motion.p
          className="mb-16 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          More than a gallery—a visual canvas for your work. Share your images,
          organize your portfolio, and showcase your creative journey—in minutes.
        </motion.p>

        {/* Input field with Create your Gallery button */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative flex-1 w-full group">
            <div className="relative">
              <Input
                type="text"
                readOnly
                className="pl-36 pr-5 py-7 text-base rounded-full border-2 border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-200"
                value=""
              />
              {/* Domain prefix */}
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none z-10">
                images-hub/
              </span>
              {/* Rotating provider carousel */}
              <div className="absolute left-36 top-1/2 -translate-y-1/2 h-7 overflow-hidden flex items-center pointer-events-none">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={currentProviderIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : {
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="text-base text-foreground font-medium whitespace-nowrap"
                  >
                    {providers[currentProviderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleCTAClick}
            className="rounded-full px-8 py-7 text-base font-semibold bg-gradient-to-r from-blue-600 via-cyan-500 via-emerald-400 via-yellow-400 via-orange-500 to-pink-500 hover:from-blue-700 hover:via-cyan-600 hover:via-emerald-500 hover:via-yellow-500 hover:via-orange-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            Create your Gallery
          </Button>
        </motion.div>

        {/* Contact Form Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Us</DialogTitle>
            </DialogHeader>
            <FeedbackForm
              initialType="general"
              onSuccess={() => setIsContactDialogOpen(false)}
              onClose={() => setIsContactDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Secondary CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 1.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={handleCTAClick}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-1 hover:decoration-2"
          >
            Want to Speak with Us? Click Here
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
