"use client";

import { motion } from "framer-motion";

/**
 * Footer component with copyright
 */
export function PortraitFooter() {
  return (
    <motion.footer
      className="border-t border-border/50 bg-muted/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Best IT Consulting. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}

