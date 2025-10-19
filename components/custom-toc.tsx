'use client';

import { AnchorProvider, ScrollProvider, TOCItem } from 'fumadocs-core/toc';
import type { TOCItemType } from 'fumadocs-core/server';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface CustomTOCProps {
  items: TOCItemType[];
  className?: string;
}

export function CustomTOC({ items, className }: CustomTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("sticky top-24 max-h-[calc(100vh-6rem)]", className)}>
      <h3 className="text-sm font-medium mb-3">On this page</h3>
      <div 
        ref={containerRef}
        className="overflow-auto max-h-[calc(100vh-8rem)] pb-4"
      >
        <AnchorProvider 
          single={true}
          toc={items}
        >
          <ScrollProvider containerRef={containerRef}>
            <div className="relative">
              {/* Active indicator line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-px bg-border"
                aria-hidden="true"
              />
              <div className="space-y-1">
                {items.map((item) => (
                  <TOCItem
                    key={item.url}
                    href={item.url}
                    className={cn(
                      "block text-sm py-1.5 px-3 text-muted-foreground hover:text-foreground transition-colors relative",
                      "data-[active=true]:text-foreground data-[active=true]:font-medium",
                      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px",
                      "before:bg-transparent data-[active=true]:before:bg-primary",
                      "before:transition-colors"
                    )}
                    style={{
                      paddingLeft: `${(item.depth - 1) * 12 + 12}px`,
                    }}
                  >
                    {item.title}
                  </TOCItem>
                ))}
              </div>
            </div>
          </ScrollProvider>
        </AnchorProvider>
      </div>
    </div>
  );
}