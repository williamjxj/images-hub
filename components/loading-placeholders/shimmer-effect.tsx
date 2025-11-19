'use client';

/**
 * Shimmer effect component for loading animations
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerEffectProps {
  className?: string;
  duration?: number;
}

/**
 * Shimmer animation effect component
 */
export function ShimmerEffect({
  className,
  duration = 1.5,
}: ShimmerEffectProps) {
  return (
    <motion.div
      className={cn(
        'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
        className
      )}
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ width: '200%' }}
    />
  );
}

