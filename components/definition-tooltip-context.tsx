'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface TooltipState {
  definitionId: string;
  triggerElement: HTMLElement;
  position: { x: number; y: number };
}

interface TooltipContextType {
  currentTooltip: TooltipState | null;
  showTooltip: (definitionId: string, element: HTMLElement) => void;
  hideTooltip: () => void;
  cancelHide: () => void;
  updatePosition: (element: HTMLElement) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    console.warn('useTooltip must be used within a TooltipProvider');
    // Return a safe fallback object instead of null
    return {
      currentTooltip: null,
      showTooltip: () => {},
      hideTooltip: () => {},
      cancelHide: () => {},
      updatePosition: () => {}
    };
  }
  return context;
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  const [currentTooltip, setCurrentTooltip] = useState<TooltipState | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    
    // Position above the element by default
    return {
      x: rect.left + scrollX + (rect.width / 2),
      y: rect.top + scrollY - 4 // 4px above for arrow space (reduced from 12px)
    };
  }, []);

  const showTooltip = useCallback((definitionId: string, element: HTMLElement) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const position = calculatePosition(element);
    
    setCurrentTooltip({
      definitionId,
      triggerElement: element,
      position
    });
  }, [calculatePosition]);

  const hideTooltip = useCallback(() => {
    // Add delay for hover interactions to allow moving from trigger to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setCurrentTooltip(null);
    }, 150);
  }, []);

  const cancelHide = useCallback(() => {
    // Cancel any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const updatePosition = useCallback((element: HTMLElement) => {
    if (currentTooltip) {
      const position = calculatePosition(element);
      setCurrentTooltip(prev => prev ? { ...prev, position } : null);
    }
  }, [currentTooltip, calculatePosition]);

  const contextValue: TooltipContextType = {
    currentTooltip,
    showTooltip,
    hideTooltip,
    cancelHide,
    updatePosition
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
}