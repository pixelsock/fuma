import Link from 'next/link';
import { Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
import { directus } from '@/lib/directus-client';
import { readItems, readItem } from '@directus/sdk';
import { getDirectusAssetUrl } from '@/lib/directus-asset-url';
import { LanguageSelector } from '@/components/language-selector';

interface FooterLink {
  id: string;
  name: string;
  category: 'logo' | 'social';
  social_platform?: 'youtube' | 'facebook' | 'instagram' | 'twitter' | null;
  logo_image?: string | null;
  url: string;
  sort: number;
}

interface GlobalSettings {
  footer_copyright_text?: string;
  languages?: Language[];
}

interface Language {
  name: string;
  code: string;
}

const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="w-6 h-6" />;
    case 'facebook':
      return <Facebook className="w-6 h-6" />;
    case 'instagram':
      return <Instagram className="w-6 h-6" />;
    case 'twitter':
      return <Twitter className="w-6 h-6" />;
    default:
      return null;
  }
};

async function getFooterData() {
  try {
    const [footerLinks, globalSettings] = await Promise.all([
      directus.request(
        readItems('footer_links' as any, {
          fields: ['*'],
          sort: ['sort'],
        })
      ),
      directus.request(
        readItem('global_settings', 1, {
          fields: ['footer_copyright_text', 'languages'],
        })
      ),
    ]);

    const settings = globalSettings as GlobalSettings;

    return {
      footerLinks: footerLinks as FooterLink[],
      copyrightText: settings?.footer_copyright_text || 'City of Charlotte. All rights reserved.',
      languages: settings?.languages || [],
    };
  } catch (error) {
    console.error('[SiteFooter] Error fetching footer data:', error);
    return {
      footerLinks: [],
      copyrightText: 'City of Charlotte. All rights reserved.',
      languages: [],
    };
  }
}

export async function SiteFooter() {
  const { footerLinks, copyrightText, languages } = await getFooterData();
  
  const logoLinks = footerLinks.filter(link => link.category === 'logo');
  const socialLinks = footerLinks.filter(link => link.category === 'social');

  return (
    <footer className="border-t bg-fd-background">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section - Logos */}
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 md:gap-3 mb-8">
          {logoLinks.map((link) => {
            const isInternal = link.url.startsWith('/');
            const logoUrl = link.logo_image ? getDirectusAssetUrl(link.logo_image) : null;
            
            if (!logoUrl) return null;

            const LogoImage = (
              <img
                src={logoUrl}
                alt={link.name}
                className="h-16 md:h-20 w-auto opacity-100 hover:opacity-70 transition-opacity"
              />
            );

            return (
              <div key={link.id} className="flex-shrink-0">
                {isInternal ? (
                  <Link href={link.url} className="block">
                    {LogoImage}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {LogoImage}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Social Media & Language Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t">
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fd-muted-foreground hover:text-fd-foreground transition-colors p-2 hover:bg-fd-accent rounded-md"
                aria-label={link.name}
              >
                {link.social_platform && <SocialIcon platform={link.social_platform} />}
              </a>
            ))}
          </div>

          {/* Language Selector */}
          <LanguageSelector languages={languages} />
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-fd-muted-foreground text-sm">
            © {new Date().getFullYear()} {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
