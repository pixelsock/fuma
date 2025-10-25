import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';
import { readItems } from '@directus/sdk';

export async function GET() {
  try {
    const documents = await directus.request(
      readItems('supporting_documents' as any, {
        fields: ['id', 'title', 'status', 'managed_by', 'link', 'file'],
        sort: ['title']
      })
    );
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching supporting documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
