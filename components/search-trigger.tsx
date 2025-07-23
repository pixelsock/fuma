'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
// Using standard HTML button instead of fumadocs button component
import { SearchCustomGrouped } from './search-custom-grouped';

export function SearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="w-full flex items-center justify-start text-fd-muted-foreground border border-fd-border rounded-md px-3 py-1.5 text-sm hover:bg-fd-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-fd-border bg-fd-muted px-1.5 font-mono text-[10px] font-medium text-fd-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <SearchCustomGrouped 
        open={open} 
        onOpenChange={setOpen} 
      />
    </>
  );
}