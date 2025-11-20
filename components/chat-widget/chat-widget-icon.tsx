'use client';

/**
 * Chat widget icon/trigger button component
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ChatWidgetIconProps {
  onClick: () => void;
  isOpen: boolean;
}

/**
 * Chat widget icon button that triggers the widget
 */
export function ChatWidgetIcon({ onClick, isOpen }: ChatWidgetIconProps) {
  return (
    <motion.div
      initial={false}
      animate={{ scale: isOpen ? 0.9 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        variant="ghost"
        className="fixed bottom-6 right-6 z-[9999] h-auto rounded-full shadow-lg hover:shadow-xl transition-shadow p-0 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        <Image
          src="/angel.webp"
          alt="AI Assistant"
          width={80}
          height={80}
          className="object-cover rounded-full"
        />
      </Button>
    </motion.div>
  );
}

