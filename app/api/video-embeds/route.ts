import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';
import { readItems } from '@directus/sdk';

export async function GET() {
  try {
    const videos = await directus.request(
      readItems('video_embeds' as any, {
        filter: {
          status: { _eq: 'published' },
          category: { _eq: 'info_sessions' }
        },
        fields: ['id', 'title', 'description', 'date', 'time', 'url', 'category', 'slides'],
        sort: ['-date', '-time'],
      })
    );

    return NextResponse.json(videos);
  } catch (error) {
    console.error('API Error fetching video embeds:', error);
    return NextResponse.json({ message: 'Failed to fetch video embeds' }, { status: 500 });
  }
}

