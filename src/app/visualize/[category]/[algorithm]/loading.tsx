import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          Loading visualization...
        </p>
      </div>
    </div>
  );
}
