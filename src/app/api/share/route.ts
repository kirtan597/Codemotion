import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { shares } from '@/server/db/schema';
import { shareInputSchema, validatePayloadSize } from '@/lib/schemas/share';
import { checkRateLimit } from '@/lib/rate-limit';
import { ZodError } from 'zod';

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting
    const isAllowed = await checkRateLimit(clientIP);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Validate payload size (50KB cap)
    if (!validatePayloadSize(body)) {
      return NextResponse.json(
        { error: 'Payload exceeds 50KB limit' },
        { status: 413 }
      );
    }
    
    // Validate with Zod
    const validatedData = shareInputSchema.parse(body);
    
    // Insert into database
    const [newShare] = await db().insert(shares).values({
      algorithmId: validatedData.algorithmId,
      input: validatedData.input,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
    }).returning({ id: shares.id });
    
    return NextResponse.json({ id: newShare.id }, { status: 201 });
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Share creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
