import { NextResponse } from 'next/server';
import { getSiteLogo } from '@/lib/directus-source';

export async function GET() {
  try {
    const logoUrl = await getSiteLogo();
    
    if (!logoUrl) {
      return NextResponse.json({
        logoUrl: null,
        error: 'No logo configured in Directus global settings'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      logoUrl,
      success: true
    });
  } catch (error) {
    console.error('Error in site-logo API:', error);
    
    return NextResponse.json({
      logoUrl: null,
      error: 'Failed to fetch logo from Directus',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}