import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus-client';
import { readItems } from '@directus/sdk';

export async function GET() {
  try {
    const amendments = await directus.request(
      readItems('text_amendments' as any, {
        filter: {
          status: { _eq: 'publish' }
        },
        fields: ['id', 'petition_number', 'ordinance_number', 'title', 'filing_date', 'public_hearing_date', 'zoning_planning_committee_date', 'city_council_decision_date', 'effective_date', 'sort'],
        sort: ['sort'],
      })
    );

    return NextResponse.json(amendments);
  } catch (error) {
    console.error('API Error fetching text amendments:', error);
    return NextResponse.json({ message: 'Failed to fetch text amendments' }, { status: 500 });
  }
}
