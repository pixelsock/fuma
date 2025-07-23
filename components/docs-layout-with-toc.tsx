'use client';

import { AnchorProvider } from 'fumadocs-core/toc';
import type { TOCItemType } from 'fumadocs-core/server';
import { CustomTOC } from './custom-toc';
import { MobileTOC } from './mobile-toc';
import type { ReactNode } from 'react';

interface DocsLayoutWithTOCProps {
  toc: TOCItemType[];
  children: ReactNode;
}

export function DocsLayoutWithTOC({ toc, children }: DocsLayoutWithTOCProps) {
  return (
    <AnchorProvider toc={toc}>
      <div className="w-full">
        {/* Mobile TOC */}
        {toc && toc.length > 0 && (
          <MobileTOC items={toc} />
        )}
        
        <div className="flex flex-row gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
          
          {/* Desktop TOC sidebar - hidden on mobile */}
          {toc && toc.length > 0 && (
            <aside className="hidden xl:block w-64 shrink-0">
              <CustomTOC items={toc} />
            </aside>
          )}
        </div>
      </div>
    </AnchorProvider>
  );
}