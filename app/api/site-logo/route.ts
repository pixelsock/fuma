import { NextResponse } from 'next/server';
import { getSiteLogo } from '@/lib/directus-source';

function getFallbackUrl(): string {
  // Check if we're in Webflow production environment
  const isWebflowProduction = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'production';
  return isWebflowProduction 
    ? '/articles/assets/udo-logo-p-500.jpg'
    : '/assets/udo-logo-p-500.jpg';
}

export async function GET() {
  try {
    const logoUrl = await getSiteLogo();
    const fallbackUrl = getFallbackUrl();
    
    return NextResponse.json({
      logoUrl: logoUrl || null,
      fallbackUrl
    });
  } catch (error) {
    console.error('Error in site-logo API:', error);
    const fallbackUrl = getFallbackUrl();
    
    return NextResponse.json({
      logoUrl: null,
      fallbackUrl,
      error: 'Failed to fetch logo'
    }, { status: 500 });
  }
}