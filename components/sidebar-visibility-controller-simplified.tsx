'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface SidebarVisibilityControllerProps {
  children: ReactNode;
  showSidebar: boolean;
  showSidebarIcon: boolean;
}

export function SidebarVisibilityController({ 
  children, 
  showSidebar, 
  showSidebarIcon 
}: SidebarVisibilityControllerProps) {
  useEffect(() => {
    // Simply add or remove the class - CSS handles the rest
    if (!showSidebar) {
      document.body.classList.add('sidebar-hidden');
    } else {
      document.body.classList.remove('sidebar-hidden');
    }
    
    return () => {
      // Only remove if we added it
      if (!showSidebar) {
        document.body.classList.remove('sidebar-hidden');
      }
    };
  }, [showSidebar]);
  
  return <>{children}</>;
}