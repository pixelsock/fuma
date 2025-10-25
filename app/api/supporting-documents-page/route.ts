import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';
import { readSingleton } from '@directus/sdk';

export async function GET() {
  try {
    const data = await directus.request(
      readSingleton('supporting_documents_page', {
        fields: ['*']
      })
    );
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching supporting documents page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    );
  }
}
