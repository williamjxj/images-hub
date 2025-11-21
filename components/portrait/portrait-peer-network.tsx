"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Peer Network Visualization Component
 * 
 * Mimics portrait.so's "A global network for your identity" section
 * Shows avatars in a network pattern with animated connections
 */
export function PortraitPeerNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const peers = [
    { id: 1, name: "Emma", x: 50, y: 30, color: "bg-blue-500" },
    { id: 2, name: "Sarah", x: 20, y: 50, color: "bg-purple-500" },
    { id: 3, name: "James", x: 80, y: 50, color: "bg-green-500" },
    { id: 4, name: "John", x: 35, y: 70, color: "bg-pink-500" },
    { id: 5, name: "Sophia", x: 65, y: 70, color: "bg-yellow-500" },
    { id: 6, name: "Anthony", x: 50, y: 90, color: "bg-indigo-500" },
  ];

  // Connections between peers
  const connections = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
  ];

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    // Animate connection lines with smoother effects
    const lines = svgRef.current.querySelectorAll("line");
    lines.forEach((line, index) => {
      const lineLength = (line as SVGLineElement).getTotalLength();
      gsap.set(line, {
        strokeDasharray: lineLength,
        strokeDashoffset: lineLength,
        opacity: 0,
      });

      gsap.fromTo(
        line,
        { 
          strokeDasharray: lineLength, 
          strokeDashoffset: lineLength, 
          opacity: 0 
        },
        {
          strokeDashoffset: "0",
          opacity: 0.4,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 25%",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const delay = index * 0.08;
              const adjustedProgress = Math.max(0, Math.min(1, progress - delay));
              const easeProgress = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress); // Smooth easing
              
              gsap.set(line, {
                strokeDashoffset: lineLength * (1 - easeProgress),
                opacity: 0.4 * easeProgress,
              });
            },
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <motion.section
      ref={containerRef}
      className="container mx-auto px-4 py-20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
          A global network for your identity, powered by people.
        </h2>
        <p className="mb-16 text-center text-lg text-muted-foreground">
          On image hubs, you search for content. On Image Hub, you create and
          share your visual story—without relying on centralized platforms.
        </p>

        {/* Network Visualization */}
        <div className="relative mx-auto aspect-video max-w-4xl rounded-2xl border border-border/50 bg-muted/30 backdrop-blur-sm p-8 shadow-xl">
          {/* SVG for connection lines */}
          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {connections.map((conn, index) => {
              const fromPeer = peers.find((p) => p.id === conn.from);
              const toPeer = peers.find((p) => p.id === conn.to);
              if (!fromPeer || !toPeer) return null;

              return (
                <line
                  key={index}
                  x1={fromPeer.x}
                  y1={fromPeer.y}
                  x2={toPeer.x}
                  y2={toPeer.y}
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className="text-primary/40"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Peer avatars */}
          <div className="relative z-10 h-full">
            {peers.map((peer, index) => (
              <motion.div
                key={peer.id}
                className="absolute group"
                style={{
                  left: `${peer.x}%`,
                  top: `${peer.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                whileHover={{ scale: 1.15, z: 20 }}
              >
                <div
                  className={`${peer.color} flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl ring-2 ring-background group-hover:ring-primary/50 transition-all duration-300`}
                  title={peer.name}
                >
                  <span className="text-base font-semibold">
                    {peer.name[0].toUpperCase()}
                  </span>
                </div>
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: -5 }}
                  whileHover={{ y: 0 }}
                >
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">
                    {peer.name}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Center text */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Requesting
              </p>
              <p className="text-xl font-bold text-foreground">Emma's Gallery</p>
            </motion.div>
          </div>
        </div>

        {/* Description text */}
        <div className="mt-12 text-center">
          <p className="mx-auto max-w-2xl text-muted-foreground">
            You and your peers store copies of each other's data, making it
            available to anyone on the internet. This is how the web should have
            been—you're helping bring it back.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

