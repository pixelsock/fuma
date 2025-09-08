'use client';

import { useTableEnhancement } from '@/hooks/use-table-enhancement';

export function TableEnhancementProvider() {
  // This will automatically enhance all tables in .udo-content containers
  useTableEnhancement('.udo-content');
  
  return null;
}