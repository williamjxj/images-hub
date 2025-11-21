"use client";

import { motion } from "framer-motion";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/border-beam";

/**
 * Features section component with feature cards
 * Explaining key benefits and value propositions
 */
export function PortraitFeatures() {
  const features = [
    {
      title: "Add Image",
      description:
        "Upload and organize your images with ease. Support for multiple formats and sizes.",
      icon: "🖼️",
    },
    {
      title: "Add Video",
      description:
        "Showcase your video content alongside your images in a unified gallery.",
      icon: "🎥",
    },
    {
      title: "Add Link",
      description:
        "Link to external resources, portfolios, or related content seamlessly.",
      icon: "🔗",
    },
    {
      title: "Add Text",
      description:
        "Add descriptions, captions, and stories to accompany your visual content.",
      icon: "📝",
    },
  ];

  return (
    <motion.section
      id="features"
      className="container mx-auto px-4 py-24 relative overflow-hidden"
      aria-labelledby="features-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Animated grid pattern background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
      />
      
      <div className="mx-auto max-w-6xl relative z-10">
        <motion.h2
          id="features-heading"
          className="mb-16 text-center text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Creating is easy.
        </motion.h2>
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ scale: 1.02, y: -8 }}
            >
              {/* Border beam effect */}
              <BorderBeam
                size={100}
                duration={8}
                delay={index * 0.5}
                colorFrom="#A97CF8"
                colorTo="#F38CB8"
                borderWidth={1}
              />
              
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/5 transition-all duration-300 rounded-2xl" />
              
              <div className="relative z-10">
                <motion.div
                  className="mb-6 text-5xl"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400,
                    damping: 15
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-3 text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

