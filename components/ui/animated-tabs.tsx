/**
 * Modern Animated Tabs Component
 * 
 * Features:
 * - Smooth animated underline indicator
 * - Gradient background on active tab
 * - Hover effects with scale animation
 * - Framer Motion for fluid transitions
 * - Modern glassmorphism design
 */

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  whiteText?: boolean;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  whiteText = false,
}: AnimatedTabsProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full bg-muted/50 p-1 backdrop-blur-sm border border-border/50",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative z-10 px-6 py-2.5 text-sm font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "rounded-full cursor-pointer flex items-center gap-2",
              isActive && whiteText
                ? "text-white"
                : isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/90 via-primary to-primary/90 shadow-lg shadow-primary/20"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
            
            <motion.span
              className="relative z-10 flex items-center gap-2"
              animate={{
                scale: isActive ? 1 : 0.95,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
              {tab.label}
            </motion.span>

            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 h-1 w-8 rounded-full bg-primary/60 blur-sm"
                initial={{ opacity: 0, x: "-50%" }}
                animate={{ opacity: 1, x: "-50%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
