'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbProps {
  category: string;
  categoryName: string;
  algorithmName: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  category,
  categoryName,
  algorithmName,
}) => {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {/* Algorithms */}
      <Link
        href="/"
        className="transition-smooth"
        style={{ color: '#9CA3AF' }}
      >
        Algorithms
      </Link>

      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#D1D5DB' }} />

      {/* Category */}
      <Link
        href={`/visualize/${category}`}
        className="transition-smooth hover:underline"
        style={{ color: '#9CA3AF' }}
      >
        {categoryName}
      </Link>

      <ChevronRight className="w-3.5 h-3.5" style={{ color: '#D1D5DB' }} />

      {/* Current Algorithm */}
      <span
        className="font-bold"
        style={{ color: '#111827' }}
        aria-current="page"
      >
        {algorithmName}
      </span>
    </nav>
  );
};
