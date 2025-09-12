'use client';

import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Definition {
  id: string;
  term: string;
  definition: string;
}

interface DefinitionTooltipProps {
  definitionId: string;
  children: React.ReactNode;
  className?: string;
}

// Custom hook to fetch definition data
function useDefinition(definitionId: string | null) {
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!definitionId) {
      setDefinition(null);
      return;
    }

    const fetchDefinition = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
        const response = await fetch(`${directusUrl}/items/definitions/${definitionId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch definition');
        }

        const data = await response.json();
        setDefinition(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load definition');
        console.error('Error fetching definition:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [definitionId]);

  return { definition, loading, error };
}

export function DefinitionTooltip({ definitionId, children, className }: DefinitionTooltipProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { definition, loading, error } = useDefinition(open ? definitionId : null);

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <span
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault();
                setOpen(!open);
              }
            }}
            className={cn(
              "text-[var(--color-fd-primary)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-fd-primary)] hover:decoration-solid transition-all",
              isMobile ? "cursor-pointer" : "cursor-help",
              className
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm border-[var(--color-fd-border)] bg-[var(--color-fd-popover)] text-[var(--color-fd-popover-foreground)]"
          sideOffset={8}
        >
          <div className="p-2">
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-fd-primary)] border-t-transparent" />
                <span className="text-sm text-[var(--color-fd-muted-foreground)]">Loading...</span>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-500">
                Error: {error}
              </div>
            )}
            
            {definition && (
              <>
                <div className="mb-2 font-semibold text-[var(--color-fd-foreground)]">
                  {definition.term}
                </div>
                <div className="text-sm text-[var(--color-fd-muted-foreground)]">
                  {definition.definition}
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}