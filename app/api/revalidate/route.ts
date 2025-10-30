import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for on-demand revalidation
 * 
 * Usage:
 * POST /api/revalidate
 * Body: { secret: "your-secret", tag: "global-settings" }
 * 
 * Or use query params:
 * POST /api/revalidate?secret=your-secret&tag=global-settings
 */
export async function POST(request: NextRequest) {
  try {
    // Get secret and tag from body or query params
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;
    
    const secret = body.secret || searchParams.get('secret');
    const tag = body.tag || searchParams.get('tag');

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { message: 'Missing tag parameter' },
        { status: 400 }
      );
    }

    // Revalidate the specified tag
    revalidateTag(tag);

    return NextResponse.json(
      { 
        revalidated: true, 
        tag,
        now: Date.now() 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    );
  }
}
