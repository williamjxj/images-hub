/**
 * Best IT Consultants Logo Component
 * 
 * Logo for Best IT Consultants (bestitconsultants.ca)
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for BestITConsultantsLogo component
 */
interface BestITConsultantsLogoProps {
  /** Logo size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as link */
  asLink?: boolean;
}

/**
 * Best IT Consultants Logo Component
 * 
 * Displays Best IT Consultants logo
 */
export function BestITConsultantsLogo({
  size = 'md',
  className,
  asLink = true,
}: BestITConsultantsLogoProps) {
  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/b22-logo.png"
        alt="Best IT Consultants"
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
        href="https://www.bestitconsultants.ca"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        aria-label="Visit Best IT Consultants"
      >
        {logoContent}
      </Link>
    );
  }
  
  return logoContent;
}

