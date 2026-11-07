'use client';

import { useState } from 'react';
import { Share2, Check, Loader2, Link as LinkIcon, MessageCircle, Mail, Copy } from 'lucide-react';
import { serializeUrlState } from '@/lib/schemas/url-state';

interface ShareButtonProps {
  algorithmId: string;
  input: any;
  speed?: number;
  step?: number;
}

export function ShareButton({ algorithmId, input, speed, step }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied'>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const generateShareUrl = async (): Promise<string> => {
    // Try Phase 13 API first
    try {
      const payload = {
        algorithmId,
        input,
      };
      
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const { id } = await response.json();
        return `${window.location.origin}/s/${id}`;
      }
    } catch (error) {
      console.warn('Phase 13 API unavailable, falling back to URL params');
    }
    
    // Fallback to URL params
    const stateParams = serializeUrlState({
      algorithm: algorithmId,
      input: JSON.stringify(input),
      speed,
      step,
    });
    
    return `${window.location.origin}${window.location.pathname}?${stateParams}`;
  };

  const handleShare = async () => {
    setStatus('loading');
    
    try {
      const url = await generateShareUrl();
      setShareUrl(url);
      
      // Try native Web Share API first (mobile & some desktop browsers)
      if (navigator.share) {
        await navigator.share({
          title: `${algorithmId} Visualization`,
          text: `Check out this ${algorithmId} algorithm visualization!`,
          url: url,
        });
        setStatus('idle');
        setIsOpen(false);
      } else {
        // Show share options menu
        setIsOpen(true);
        setStatus('idle');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled share dialog
        setStatus('idle');
      } else {
        console.error('Share error:', error);
        // Show menu as fallback
        setIsOpen(true);
        setStatus('idle');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareVia = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(`Check out this ${algorithmId} algorithm visualization!`);
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=Algorithm Visualization&body=${encodedText}%0A%0A${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
        aria-label="Share visualization"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'copied' && <Check className="w-4 h-4" />}
        {status === 'idle' && <Share2 className="w-4 h-4" />}
        <span>{status === 'copied' ? 'Copied!' : 'Share'}</span>
      </button>
      
      {isOpen && shareUrl && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-[110] overflow-hidden">
            {/* Copy Link Section */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <LinkIcon className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Share Link
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-zinc-600 dark:text-zinc-400"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                  title="Copy to clipboard"
                >
                  {status === 'copied' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Options */}
            <div className="p-3">
              <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-2 tracking-wider">
                Share via
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => shareVia('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share on WhatsApp"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    WhatsApp
                  </span>
                </button>

                <button
                  onClick={() => shareVia('twitter')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share on Twitter"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    Twitter
                  </span>
                </button>

                <button
                  onClick={() => shareVia('facebook')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share on Facebook"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    Facebook
                  </span>
                </button>

                <button
                  onClick={() => shareVia('telegram')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share on Telegram"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    Telegram
                  </span>
                </button>

                <button
                  onClick={() => shareVia('linkedin')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share on LinkedIn"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    LinkedIn
                  </span>
                </button>

                <button
                  onClick={() => shareVia('email')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title="Share via Email"
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
