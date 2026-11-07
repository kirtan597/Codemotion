'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface LogoProps {
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ onClick }) => {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-center gap-3 group cursor-pointer"
    >
      {/* SVG Logo Icon */}
      <div className="shrink-0 w-11 h-11 relative">
        <Image
          src="/codemotion-logo.svg"
          alt="CodeMotion Logo"
          width={44}
          height={44}
          className="w-11 h-11 transition-smooth group-hover:scale-105"
          style={{
            filter: 'drop-shadow(0 6px 16px rgba(124, 58, 237, 0.30))',
          }}
        />
      </div>

      {/* CodeMotion Wordmark */}
      <h1
        className="text-[22px] font-bold leading-tight tracking-tight transition-smooth"
        style={{
          background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #A855F7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}
      >
        CodeMotion
      </h1>
    </Link>
  );
};
