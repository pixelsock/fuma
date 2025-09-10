import { getSiteLogo } from '@/lib/directus-source';

interface DynamicLogoProps {
  fallbackSrc?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

// Smart fallback that works for both local and production
function getFallbackLogoSrc(): string {
  // In production with Webflow, use the /articles prefix
  if (typeof window !== 'undefined') {
    // Client-side: check current location
    return window.location.pathname.startsWith('/articles') 
      ? '/articles/assets/udo-logo-p-500.jpg'
      : '/assets/udo-logo-p-500.jpg';
  } else {
    // Server-side: check environment
    const isWebflowProduction = process.env.NODE_ENV === 'production' && process.env.DEPLOYMENT_ENV === 'production';
    return isWebflowProduction 
      ? '/articles/assets/udo-logo-p-500.jpg'
      : '/assets/udo-logo-p-500.jpg';
  }
}

export async function DynamicLogo({
  fallbackSrc,
  alt = "Charlotte UDO Logo",
  width = "120",
  height = "48",
  className = "h-8 w-auto"
}: DynamicLogoProps) {
  const defaultFallback = getFallbackLogoSrc();
  let logoSrc = fallbackSrc || defaultFallback;
  
  try {
    // Try to fetch the dynamic logo from Directus
    const directusLogo = await getSiteLogo();
    if (directusLogo) {
      logoSrc = directusLogo;
      console.log('[DynamicLogo] Using Directus logo:', logoSrc);
    } else {
      console.log('[DynamicLogo] No Directus logo found, using fallback');
    }
  } catch (error) {
    console.warn('[DynamicLogo] Error loading dynamic logo, using fallback:', error);
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}