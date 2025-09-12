'use client';

import { useTableEnhancementV2 } from '@/hooks/use-table-enhancement-v2';

export function TableEnhancementProviderV2() {
  // This will automatically enhance all tables in .udo-content containers
  useTableEnhancementV2('.udo-content');
  
  return null;
}


