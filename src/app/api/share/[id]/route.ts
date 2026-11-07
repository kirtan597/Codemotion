import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { shares } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Atomically increment views and fetch share
    const [share] = await db()
      .update(shares)
      .set({ views: sql`${shares.views} + 1` })
      .where(eq(shares.id, id))
      .returning();
    
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }
    
    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Share has expired' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: share.id,
      algorithmId: share.algorithmId,
      input: share.input,
      createdAt: share.createdAt,
      views: share.views,
    });
    
  } catch (error) {
    console.error('Share retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
