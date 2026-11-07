import { notFound } from 'next/navigation';
import { VisualizerView } from '@/components/visualizers/VisualizerView';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

async function getShare(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/share/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch share:', error);
    return null;
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const share = await getShare(id);
  
  if (!share) {
    notFound();
  }
  
  // Extract category from algorithmId
  const algorithm = share.algorithmId;
  
  let category = 'sorting';
  if (algorithm.includes('search')) {
    category = 'searching';
  } else if (algorithm.includes('dijkstra') || algorithm.includes('bfs') || algorithm.includes('dfs')) {
    category = 'graph';
  } else if (algorithm.includes('bst') || algorithm.includes('tree')) {
    category = 'tree';
  } else if (algorithm.includes('knapsack') || algorithm.includes('lcs')) {
    category = 'dp';
  }
  
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 bg-violet-600 text-white px-4 py-2 text-sm text-center">
        📤 Shared visualization • {share.views} views
      </div>
      <div className="pt-10">
        <VisualizerView category={category} algorithmId={algorithm} />
      </div>
    </div>
  );
}
