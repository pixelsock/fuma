import { NextResponse } from 'next/server'
import { getLatestUpdates } from '@/lib/directus-source'

export async function GET() {
  try {
    const updates = await getLatestUpdates()
    return NextResponse.json(updates)
  } catch (error) {
    console.error('Error fetching latest updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest updates' },
      { status: 500 }
    )
  }
}
