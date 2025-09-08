import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookIcon } from 'lucide-react';

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
      <img
        src="/assets/udo-logo-p-500.jpg"
        alt="Charlotte UDO Logo"
        width="120"
        height="48"
        className="h-8 w-auto"
      />
    ),
  },
};
