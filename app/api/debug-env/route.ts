import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DIRECTUS_URL: process.env.DIRECTUS_URL || 'not set',
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'not set',
    DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN ? 'set (hidden)' : 'not set',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}