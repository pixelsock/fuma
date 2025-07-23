'use client';

import { AnchorProvider, ScrollProvider, TOCItem, useActiveAnchor } from 'fumadocs-core/toc';
import type { TOCItemType } from 'fumadocs-core/server';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface MobileTOCProps {
  items: TOCItemType[];
}

function TOCContent({ items }: { items: TOCItemType[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeAnchor = useActiveAnchor();

  return (
    <div 
      ref={containerRef}
      className="max-h-[50vh] overflow-auto pb-4"
    >
      <ScrollProvider containerRef={containerRef}>
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = activeAnchor === item.url.slice(1); // Remove # from URL
            return (
              <TOCItem
                key={item.url}
                href={item.url}
                className={cn(
                  "block text-sm py-1.5 px-3 text-muted-foreground hover:text-foreground transition-colors",
                  "data-[active=true]:text-foreground data-[active=true]:font-medium",
                  isActive && "text-foreground font-medium"
                )}
                style={{
                  paddingLeft: `${(item.depth - 1) * 12 + 12}px`,
                }}
              >
                {item.title}
              </TOCItem>
            );
          })}
        </div>
      </ScrollProvider>
    </div>
  );
}

export function MobileTOC({ items }: MobileTOCProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeAnchor = useActiveAnchor();

  if (!items || items.length === 0) {
    return null;
  }

  // Find the current active item
  const activeItem = items.find(item => item.url.slice(1) === activeAnchor);
  const displayTitle = activeItem?.title || items[0]?.title || 'Table of Contents';

  return (
    <AnchorProvider toc={items}>
      <div className="sticky top-0 z-10 xl:hidden h-10 border-b backdrop-blur-sm bg-background/80">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-row items-center text-sm text-muted-foreground gap-2.5 px-4 py-2.5 text-start w-full hover:bg-accent/50 transition-colors"
          aria-expanded={isOpen}
        >
          <span className="flex-1 truncate font-medium text-foreground">
            {displayTitle}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg">
            <TOCContent items={items} />
          </div>
        )}
      </div>
    </AnchorProvider>
  );
}