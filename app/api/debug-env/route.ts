import { NextResponse } from 'next/server';
import { getEnvironmentStatus } from '@/lib/env-config';

export async function GET() {
  try {
    const envStatus = getEnvironmentStatus();
    
    const debugInfo = {
      ...envStatus,
      // Raw environment variables for debugging
      raw: {
        NODE_ENV: process.env.NODE_ENV,
        DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
        LOCAL_DIRECTUS_URL: process.env.LOCAL_DIRECTUS_URL,
        PRODUCTION_DIRECTUS_URL: process.env.PRODUCTION_DIRECTUS_URL,
        NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
        DIRECTUS_URL: process.env.DIRECTUS_URL,
        DIRECTUS_TOKEN: process.env.DIRECTUS_TOKEN ? 'set (hidden)' : 'not set',
      },
      // All env keys containing 'DIRECTUS' or 'DEPLOYMENT'
      allDirectusKeys: Object.keys(process.env).filter(key => 
        key.includes('DIRECTUS') || key.includes('DEPLOYMENT')
      ).reduce((acc, key) => {
        acc[key] = key.includes('TOKEN') || key.includes('PASSWORD') ? 
          (process.env[key] ? 'set (hidden)' : 'not set') : 
          process.env[key];
        return acc;
      }, {} as Record<string, string | undefined>),
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get environment status',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}