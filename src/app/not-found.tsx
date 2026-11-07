import { FileQuestion, Play } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-purple-950/20 p-6">
      <div className="max-w-md w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
              <Play className="w-8 h-8 text-white fill-current" />
            </div>
          </div>
        </div>

        {/* 404 Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          The algorithm you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
        >
          <Play className="w-4 h-4" />
          <span>Back to CodeMotion</span>
        </Link>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
          <a href="https://codemotion.dev" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            codemotion.dev
          </a>
        </p>
      </div>
    </div>
  );
}
