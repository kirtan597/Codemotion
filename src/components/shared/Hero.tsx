'use client';

import React from 'react';
import { Play, Sparkles, Zap, Code2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-purple-950/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          {/* Logo Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                <Play className="w-10 h-10 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                CodeMotion
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 font-medium max-w-3xl mx-auto">
              Experience algorithms in motion
            </p>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-500 max-w-2xl mx-auto">
              Interactive visualizations of 144+ algorithms across 16 categories
              with step-by-step execution and real-time analysis
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">144 Algorithms</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Real-time Visualization</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/50 shadow-lg">
              <Code2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Step-by-step Execution</span>
            </div>
          </div>

          {/* URL */}
          <div className="pt-4">
            <a
              href="https://codemotion.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-mono text-sm transition-colors"
            >
              <span>codemotion.dev</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
