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
  fetchDefinition: (id: string) => void;
  prefetchDefinitions: (ids: string[]) => void;
}

const DefinitionDataContext = createContext<DefinitionDataContextType | undefined>(undefined);

export function useDefinitionData() {
  const context = useContext(DefinitionDataContext);
  if (!context) {
    throw new Error('useDefinitionData must be used within a DefinitionDataProvider');
  }
  return context;
}

async function fetchDefinitionAPI(id: string): Promise<Definition> {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';
  const response = await fetch(`${directusUrl}/items/definitions/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
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

  const fetchDefinition = useCallback(async (id: string) => {
    if (definitions[id] || fetchingRef.current.has(id)) {
      return;
    }

    fetchingRef.current.add(id);
    setLoading(prev => ({ ...prev, [id]: true }));
    setErrors(prev => ({ ...prev, [id]: null }));

    try {
      const data = await fetchDefinitionAPI(id);
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
  };

  return (
    <DefinitionDataContext.Provider value={value}>
      {children}
    </DefinitionDataContext.Provider>
  );
} 