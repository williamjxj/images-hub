"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Globe } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Benefits section component explaining key value propositions
 * Clean, professional design matching portrait.so aesthetic
 */
export function PortraitBenefits() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  const benefits = [
    {
      title: "Unbreakable, truly yours.",
      description:
        "Your data is yours, secured by aerospace-grade cryptography. Your gallery is cryptographically signed—verifiable, tamper-proof, and portable. Even if platforms vanish, your presence remains intact and publicly provable.",
      icon: Lock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      title: "Lightweight, by design.",
      description:
        "Easy to use, easy to host. No servers required. Just you. Your gallery runs on lightweight edge nodes—browsers, apps, and devices you already use. Hosting is distributed, efficient, and forgiving, making it accessible to anyone, anywhere.",
      icon: Zap,
      iconColor: "text-yellow-500",
      iconBg: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      title: "Built on protocols, not platforms.",
      description:
        "Open source, open standards. No vendor lock-in. Your content lives on open infrastructure—not inside walled gardens—so it remains usable across platforms and time.",
      icon: Globe,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
    },
  ];

  // GSAP staggered reveal animation for titles
  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current || titleRefs.current.length === 0) return;

    const titles = titleRefs.current.filter(Boolean) as HTMLHeadingElement[];
    
    titles.forEach((title, index) => {
      // Split title into words for character-by-character animation
      const words = title.textContent?.split(" ") || [];
      title.innerHTML = words
        .map((word, wordIndex) => {
          return word
            .split("")
            .map(
              (char, charIndex) =>
                `<span class="inline-block" style="opacity: 0; transform: translateY(20px);">${char === " " ? "&nbsp;" : char}</span>`
            )
            .join("");
        })
        .join(" ");

      const chars = title.querySelectorAll("span");

      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: {
            amount: 0.8,
            from: "start",
          },
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
            end: "top 50%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger && sectionRef.current?.contains(trigger.vars.trigger as Node)) {
          trigger.kill();
        }
      });
    };
  }, [prefersReducedMotion]);

  return (
    <motion.section
      ref={sectionRef}
      id="benefits"
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 relative overflow-hidden"
      aria-labelledby="benefits-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Animated grid pattern background */}
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.08}
        duration={4}
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
      />
      
      <div className="mx-auto max-w-5xl relative z-10">
        <motion.h2
          id="benefits-heading"
          className="mb-24 text-center text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Designed for anyone. Open to the world.
        </motion.h2>
        
        <div className="space-y-28 md:space-y-32">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={prefersReducedMotion ? { duration: 0 } : { 
                  delay: index * 0.1,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <div className="flex flex-col gap-6 md:gap-8">
                  {/* Icon and Title on same line */}
                  <div className="flex items-center gap-4 md:gap-6">
                    {/* Icon */}
                    <motion.div
                      className={`flex-shrink-0 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${benefit.iconBg} ${benefit.iconColor} transition-all duration-300`}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotate: -3 }}
                      transition={prefersReducedMotion ? {} : { 
                        type: "spring",
                        stiffness: 400,
                        damping: 25
                      }}
                    >
                      <IconComponent className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
                    </motion.div>

                    {/* Title with GSAP animation */}
                    <h3
                      ref={(el) => {
                        titleRefs.current[index] = el;
                      }}
                      className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight text-foreground"
                    >
                      {benefit.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

