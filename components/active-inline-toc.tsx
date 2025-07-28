'use client';

import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import type { TOCItemType } from 'fumadocs-core/server';

interface ActiveInlineTOCProps {
  items: TOCItemType[];
}

export function ActiveInlineTOC({ items }: ActiveInlineTOCProps) {
  return (
    <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-3">Table of Contents</h2>
      <InlineTOC items={items} />
    </div>
  );
}