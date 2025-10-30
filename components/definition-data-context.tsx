'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface Definition {
  id: string;
  term: string;
  definition: string;
}

type DefinitionCache = { [key: string]: Definition };
type LoadingState = { [key: string]: boolean };
type ErrorState = { [key: string]: string | null };

interface DefinitionDataContextType {
  definitions: DefinitionCache;
  loading: LoadingState;
  errors: ErrorState;
  fetchDefinition: (id: string, forceRefresh?: boolean) => void;
  prefetchDefinitions: (ids: string[]) => void;
  clearDefinition: (id: string) => void;
}

const DefinitionDataContext = createContext<DefinitionDataContextType | undefined>(undefined);

export function useDefinitionData() {
  const context = useContext(DefinitionDataContext);
  if (!context) {
    throw new Error('useDefinitionData must be used within a DefinitionDataProvider');
  }
  return context;
}

async function fetchDefinitionAPI(id: string, forceRefresh = false): Promise<Definition> {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const url = `${directusUrl}/items/definitions/${id}${forceRefresh ? `?t=${Date.now()}` : ''}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch definition ${id}`);
  }
  const result = await response.json();
  return result.data;
}

export function DefinitionDataProvider({ children }: { children: ReactNode }) {
  const [definitions, setDefinitions] = useState<DefinitionCache>({});
  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  
  const fetchingRef = useRef<Set<string>>(new Set());

  const fetchDefinition = useCallback(async (id: string, forceRefresh = false) => {
    // Skip if already fetching (unless forcing refresh)
    if (!forceRefresh && (definitions[id] || fetchingRef.current.has(id))) {
      return;
    }

    // If forcing refresh, clear the cached definition first
    if (forceRefresh && definitions[id]) {
      setDefinitions(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    fetchingRef.current.add(id);
    setLoading(prev => ({ ...prev, [id]: true }));
    setErrors(prev => ({ ...prev, [id]: null }));

    try {
      const data = await fetchDefinitionAPI(id, forceRefresh);
      setDefinitions(prev => ({ ...prev, [id]: data }));
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load definition';
      setErrors(prev => ({...prev, [id]: errorMessage}));
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
      fetchingRef.current.delete(id);
    }
  }, [definitions]);

  const clearDefinition = useCallback((id: string) => {
    setDefinitions(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Refetch immediately after clearing
    fetchDefinition(id, true);
  }, [fetchDefinition]);

  const prefetchDefinitions = useCallback((ids: string[]) => {
    ids.forEach(id => {
      if (!definitions[id] && !fetchingRef.current.has(id)) {
        fetchDefinition(id);
      }
    });
  }, [definitions, fetchDefinition]);

  const value = {
    definitions,
    loading,
    errors,
    fetchDefinition,
    prefetchDefinitions,
    clearDefinition,
  };

  return (
    <DefinitionDataContext.Provider value={value}>
      {children}
    </DefinitionDataContext.Provider>
  );
} 