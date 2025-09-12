import { getSiteLogo } from '@/lib/directus-source';

interface DynamicLogoProps {
  alt?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export async function DynamicLogo({
  alt = "Charlotte UDO Logo",
  width = "120",
  height = "48",
  className = "h-8 w-auto"
}: DynamicLogoProps) {
  try {
    // Fetch the dynamic logo from Directus
    const logoSrc = await getSiteLogo();
    
    if (!logoSrc) {
      console.warn('[DynamicLogo] No logo found in Directus settings');
      return null; // Return null instead of fallback
    }

    console.log('[DynamicLogo] Using Directus logo:', logoSrc);
    
    return (
      <img
        src={logoSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  } catch (error) {
    console.error('[DynamicLogo] Error loading dynamic logo:', error);
    return null; // Return null instead of fallback
  }
}