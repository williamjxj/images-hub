"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PortraitImage {
  id: string;
  url: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
  author: string;
  authorUrl: string;
  description: string;
}

/**
 * Parallax Gallery Component
 * 
 * Implements the portrait.so effect where images move horizontally
 * from left/right sides to underneath centered thumbnails as user scrolls.
 * 
 * Animation Details:
 * - Images start positioned off-screen (left/right)
 * - As user scrolls, images move horizontally toward center using GSAP ScrollTrigger
 * - Different scroll speeds create parallax effect
 * - Center thumbnails fade in and scale up
 * - Smooth scrubbing (1.5) for responsive scroll-linked animation
 */
export function PortraitParallaxGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftImagesRef = useRef<HTMLDivElement>(null);
  const rightImagesRef = useRef<HTMLDivElement>(null);
  const centerThumbnailsRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<PortraitImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch beautiful images from Unsplash - diverse high-quality images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Use specific curated queries for high-quality, diverse images
        const queries = [
          "portrait photography woman",
          "nature landscape mountains",
          "science laboratory research",
          "fashion model photography",
          "beautiful scenery nature",
          "architecture modern design",
          "portrait studio lighting",
          "ocean beach sunset",
          "technology science innovation"
        ];
        
        const imagePromises = queries.map(query =>
          fetch(`/api/portrait/images?query=${encodeURIComponent(query)}&count=2`)
            .then(res => res.json())
            .then(data => data.images?.[0] || null)
            .catch(() => null)
        );
        
        const fetchedImages = await Promise.all(imagePromises);
        const validImages = fetchedImages.filter(img => img !== null);
        
        if (validImages.length >= 9) {
          setImages(validImages.slice(0, 9));
        } else if (validImages.length > 0) {
          // Fill remaining slots with fallback images
          const fallback = await fetch("/api/portrait/images?query=photography art&count=9")
            .then(res => res.json())
            .then(data => data.images?.slice(0, 9 - validImages.length) || [])
            .catch(() => []);
          setImages([...validImages, ...fallback].slice(0, 9));
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Setup GSAP ScrollTrigger animations
  useEffect(() => {
    if (
      !containerRef.current ||
      !leftImagesRef.current ||
      !rightImagesRef.current ||
      !centerThumbnailsRef.current ||
      images.length === 0
    ) {
      return;
    }

    const container = containerRef.current;
    const leftImages = Array.from(leftImagesRef.current.children);
    const rightImages = Array.from(rightImagesRef.current.children);
    const centerThumbnails = Array.from(centerThumbnailsRef.current.children);

    // Calculate positions - images should move significantly toward center
    const containerWidth = container.offsetWidth;
    const getInitialX = (isLeft: boolean) => {
      if (typeof window === "undefined") return 0;
      // Start more visible - images should be partially on screen initially
      const containerWidth = container.offsetWidth || window.innerWidth;
      return isLeft ? -containerWidth * 0.25 : containerWidth * 0.25;
    };
    
    // Calculate how far images should move toward center
    // Left images need to move right (positive X), right images need to move left (negative X)
    // Move them to approximately center of container
    const getCenterOffset = (isLeft: boolean) => {
      // Move images about 50% toward center for smoother convergence
      const moveDistance = containerWidth * 0.4; // Move 40% of container width toward center
      return isLeft ? moveDistance : -moveDistance;
    };

    // Set initial positions immediately before creating animations
    // Make images visible initially for better UX
    leftImages.forEach((image) => {
      const imageEl = image as HTMLElement;
      const initialX = getInitialX(true);
      gsap.set(imageEl, {
        x: initialX,
        opacity: 0.6, // More visible initially
        scale: 0.85,
        rotation: -5,
      });
    });

    rightImages.forEach((image) => {
      const imageEl = image as HTMLElement;
      const initialX = getInitialX(false);
      gsap.set(imageEl, {
        x: initialX,
        opacity: 0.6, // More visible initially
        scale: 0.85,
        rotation: 5,
      });
    });

    centerThumbnails.forEach((thumbnail) => {
      gsap.set(thumbnail as HTMLElement, {
        scale: 0.4,
        opacity: 0,
        y: 40,
      });
    });

    // Animate left images: move from left to center
    leftImages.forEach((image, index) => {
      const imageEl = image as HTMLElement;
      const initialX = getInitialX(true);
      const centerOffset = getCenterOffset(true);
      const finalX = initialX + centerOffset; // Move from initial position toward center
      
      gsap.fromTo(
        imageEl,
        {
          x: initialX,
          opacity: 0.6, // Start more visible
          scale: 0.85,
          rotation: -5,
          immediateRender: true, // Render immediately
        },
        {
          x: finalX,
          opacity: 1,
          scale: 1,
          rotation: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 85%", // Start earlier - animation begins when section is 85% down viewport
            end: "bottom 15%", // End later - ensures full convergence before section ends
            scrub: 1, // Smooth scrubbing
            invalidateOnRefresh: true, // Recalculate on refresh
            refreshPriority: 1, // High priority for refresh
            onUpdate: (self) => {
              const progress = self.progress;
              const delay = index * 0.1; // Stagger delay
              const adjustedProgress = Math.max(0, Math.min(1, progress - delay));
              const easeProgress = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress); // Smooth easing
              
              gsap.set(imageEl, {
                x: initialX + centerOffset * easeProgress,
                opacity: 0.6 + easeProgress * 0.4, // Animate from 0.6 to 1.0
                scale: 0.85 + easeProgress * 0.15, // Animate from 0.85 to 1.0
                rotation: -5 + easeProgress * 5, // Rotate to 0
              });
            },
          },
        }
      );
    });

    // Animate right images: move from right to center
    rightImages.forEach((image, index) => {
      const imageEl = image as HTMLElement;
      const initialX = getInitialX(false);
      const centerOffset = getCenterOffset(false);
      const finalX = initialX + centerOffset; // Move from initial position toward center
      
      gsap.fromTo(
        imageEl,
        {
          x: initialX,
          opacity: 0.6, // Start more visible
          scale: 0.85,
          rotation: 5,
          immediateRender: true, // Render immediately
        },
        {
          x: finalX,
          opacity: 1,
          scale: 1,
          rotation: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 85%", // Start earlier
            end: "bottom 15%", // End later for full convergence
            scrub: 1, // Smooth scrubbing
            invalidateOnRefresh: true, // Recalculate on refresh
            refreshPriority: 1, // High priority for refresh
            onUpdate: (self) => {
              const progress = self.progress;
              const delay = index * 0.1; // Stagger delay
              const adjustedProgress = Math.max(0, Math.min(1, progress - delay));
              const easeProgress = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress); // Smooth easing
              
              gsap.set(imageEl, {
                x: initialX + centerOffset * easeProgress,
                opacity: 0.6 + easeProgress * 0.4, // Animate from 0.6 to 1.0
                scale: 0.85 + easeProgress * 0.15, // Animate from 0.85 to 1.0
                rotation: 5 - easeProgress * 5, // Rotate to 0
              });
            },
          },
        }
      );
    });

    // Animate center thumbnails: fade in and scale up
    centerThumbnails.forEach((thumbnail, index) => {
      gsap.fromTo(
        thumbnail as HTMLElement,
        {
          scale: 0.4,
          opacity: 0,
          y: 40,
          immediateRender: true, // Render immediately
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: container,
            start: "top 80%", // Start earlier
            end: "bottom 20%", // End later
            scrub: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const delay = index * 0.12; // Stagger delay
              const adjustedProgress = Math.max(0, Math.min(1, progress - delay));
              const easeProgress = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress); // Smooth easing
              
              gsap.set(thumbnail as HTMLElement, {
                scale: 0.4 + easeProgress * 0.6,
                opacity: easeProgress,
                y: 40 * (1 - easeProgress),
              });
            },
          },
        }
      );
    });

    // Refresh ScrollTrigger after setup to ensure proper initialization
    ScrollTrigger.refresh();

    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [images]);

  // Split images into left, right, and center groups
  const leftImages = images.slice(0, 3);
  const rightImages = images.slice(3, 6);
  const centerThumbnails = images.slice(6, 9);

  if (loading) {
    return (
      <section className="relative min-h-[150vh] overflow-hidden py-32">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading images...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-[150vh] overflow-hidden py-32"
      aria-label="Parallax image gallery demonstration"
    >
      {/* Background gradient for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Descriptive text at the top */}
        <div className="text-center mb-20 pt-8">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Scroll to see images converge
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Images from the left and right sides move toward the center as you
            scroll, creating a dynamic parallax effect inspired by portrait.so.
          </p>
        </div>

        {/* Center thumbnails - these stay centered and fade in */}
        <div
          ref={centerThumbnailsRef}
          className="flex justify-center items-center gap-4 md:gap-6 mb-32"
        >
          {centerThumbnails.map((image) => (
            <div
              key={image.id}
              className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl backdrop-blur-sm"
              aria-label={image.description || "Gallery thumbnail"}
            >
              <Image
                src={image.thumb}
                alt={image.description || `Thumbnail by ${image.author}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, (max-width: 1024px) 112px, 128px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Left images - move from left to center */}
        <div
          ref={leftImagesRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-12 md:gap-16 z-20"
          style={{ willChange: "transform" }}
        >
          {leftImages.map((image) => (
            <div
              key={image.id}
              className="relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl backdrop-blur-sm"
              aria-label={image.description || `Image by ${image.author}`}
              style={{ willChange: "transform" }}
            >
              <Image
                src={image.url}
                alt={image.description || `Image by ${image.author}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 224px, 288px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                <p className="text-xs text-white/90 truncate font-medium">
                  Photo by{" "}
                  <a
                    href={image.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline hover:text-white transition-colors"
                  >
                    {image.author}
                  </a>{" "}
                  on Unsplash
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right images - move from right to center */}
        <div
          ref={rightImagesRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-12 md:gap-16 z-20"
          style={{ willChange: "transform" }}
        >
          {rightImages.map((image) => (
            <div
              key={image.id}
              className="relative w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-2xl backdrop-blur-sm"
              aria-label={image.description || `Image by ${image.author}`}
              style={{ willChange: "transform" }}
            >
              <Image
                src={image.url}
                alt={image.description || `Image by ${image.author}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 160px, (max-width: 1024px) 224px, 288px"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                <p className="text-xs text-white/90 truncate font-medium">
                  Photo by{" "}
                  <a
                    href={image.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline hover:text-white transition-colors"
                  >
                    {image.author}
                  </a>{" "}
                  on Unsplash
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom spacing for scroll effect */}
        <div className="h-32" />
      </div>
    </section>
  );
}
