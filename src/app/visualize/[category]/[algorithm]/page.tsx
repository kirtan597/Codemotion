import { VisualizerView } from '@/components/visualizers/VisualizerView';
import { ALGORITHMS, getAlgorithm } from '@/lib/algorithms/registry';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    category: string;
    algorithm: string;
  }>;
}

export function generateStaticParams() {
  return ALGORITHMS.map((algo) => ({
    category: algo.category,
    algorithm: algo.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { algorithm } = await params;
  const algo = getAlgorithm(algorithm);
  
  if (!algo) {
    return {
      title: 'Algorithm Not Found',
    };
  }
  
  return {
    title: `${algo.name} - CodeMotion`,
    description: algo.description,
    openGraph: {
      title: `${algo.name} Visualization`,
      description: `${algo.description} - Interactive step-by-step visualization with complexity analysis.`,
      type: 'website',
      siteName: 'CodeMotion',
      images: [
        {
          url: '/og-image.svg',
          width: 1200,
          height: 630,
          alt: `${algo.name} Visualization`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${algo.name} - CodeMotion`,
      description: algo.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function AlgorithmPage({ params }: PageProps) {
  const { category, algorithm } = await params;
  return <VisualizerView category={category} algorithmId={algorithm} />;
}
