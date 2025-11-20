/**
 * Best IT Consulting Logo Component
 * 
 * Logo for Best IT Consulting (bestitconsulting.ca)
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for BestITLogo component
 */
interface BestITLogoProps {
  /** Logo size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as link */
  asLink?: boolean;
}

/**
 * Best IT Consulting Logo Component
 * 
 * Displays Best IT Consulting logo
 */
export function BestITLogo({ size = 'md', className, asLink = true }: BestITLogoProps) {
  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/b11-logo.png"
        alt="Best IT Consulting"
        width={120}
        height={32}
        className="object-contain w-auto"
        style={{ height: '32px' }}
      />
      {asLink && (
        <ExternalLink className="h-3 w-3 text-muted-foreground" />
      )}
    </div>
  );
  
  if (asLink) {
    return (
      <Link
        href="https://www.bestitconsulting.ca"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        aria-label="Visit Best IT Consulting"
      >
        {logoContent}
      </Link>
    );
  }
  
  return logoContent;
}

