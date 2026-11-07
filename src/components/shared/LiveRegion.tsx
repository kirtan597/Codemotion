'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  level?: 'polite' | 'assertive';
}

export function LiveRegion({ message, level = 'polite' }: LiveRegionProps) {
  const prevMessageRef = useRef<string>('');

  useEffect(() => {
    prevMessageRef.current = message;
  }, [message]);

  // Only announce if message actually changed
  const shouldAnnounce = message !== prevMessageRef.current && message !== '';

  return (
    <div
      className="sr-only"
      role="status"
      aria-live={level}
      aria-atomic="true"
    >
      {shouldAnnounce ? message : ''}
    </div>
  );
}
