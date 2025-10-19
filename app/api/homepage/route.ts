import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';
import { readItem } from '@directus/sdk';

export async function GET() {
  try {
    const homepage = await directus.request(
      readItem('home_page', 1, {
        fields: ['*']
      })
    );

    // Clean up key_resources to remove duplicates
    if (homepage.key_resources) {
      homepage.key_resources = homepage.key_resources.filter((resource: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => r.title === resource.title)
      );
    }

    return NextResponse.json(homepage);
  } catch (error) {
    console.error('API Error fetching homepage:', error);
    return NextResponse.json({ message: 'Failed to fetch homepage data' }, { status: 500 });
  }
}
