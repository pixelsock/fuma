import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookIcon } from 'lucide-react';
import { DynamicLogo } from '@/components/dynamic-logo';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <DynamicLogo
        alt="Charlotte UDO Logo"
        width="120"
        height="48"
        className="h-8 w-auto"
      />
    ),
  },
};
