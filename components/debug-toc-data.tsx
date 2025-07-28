'use client';

import { useEffect } from 'react';

interface DebugTOCDataProps {
  toc: any[];
}

export function DebugTOCData({ toc }: DebugTOCDataProps) {
  useEffect(() => {
    console.log('TOC Data passed to page:', toc);
    console.log('TOC length:', toc?.length || 0);
    
    if (toc && toc.length > 0) {
      console.log('First TOC item:', toc[0]);
      console.log('TOC structure:', toc.map(item => ({
        title: item.title,
        url: item.url,
        depth: item.depth
      })));
    }
  }, [toc]);
  
  return null;
}