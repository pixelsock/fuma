'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';

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

// Cache definitions in sessionStorage for faster subsequent loads
const CACHE_KEY = 'udo-definitions-cache';
const CACHE_VERSION = '1.0';
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface CachedDefinition extends Definition {
  timestamp: number;
}

function getCachedDefinitions(): DefinitionCache {
  if (typeof window === 'undefined') return {};
  
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    
    const { version, data } = JSON.parse(cached);
    if (version !== CACHE_VERSION) {
      sessionStorage.removeItem(CACHE_KEY);
      return {};
    }
    
    const now = Date.now();
    const validDefinitions: DefinitionCache = {};
    
    Object.entries(data).forEach(([id, def]) => {
      const cachedDef = def as CachedDefinition;
      if (now - cachedDef.timestamp < CACHE_TTL) {
        const { timestamp, ...definition } = cachedDef;
        validDefinitions[id] = definition;
      }
    });
    
    return validDefinitions;
  } catch {
    return {};
  }
}

function setCachedDefinitions(definitions: DefinitionCache) {
  if (typeof window === 'undefined') return;
  
  try {
    const timestamp = Date.now();
    const data: { [key: string]: CachedDefinition } = {};
    
    Object.entries(definitions).forEach(([id, def]) => {
      data[id] = { ...def, timestamp };
    });
    
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      version: CACHE_VERSION,
      data
    }));
  } catch {
    // Ignore storage errors
  }
}

// Batch fetch multiple definitions in a single request
async function fetchDefinitionsBatch(ids: string[]): Promise<Definition[]> {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
  
  // Build filter query for multiple IDs
  const filter = {
    id: {
      _in: ids
    }
  };
  
  const response = await fetch(`${directusUrl}/items/definitions?filter=${encodeURIComponent(JSON.stringify(filter))}&limit=-1`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch definitions`);
  }
  
  const result = await response.json();
  return result.data;
}

export function DefinitionDataProvider({ children }: { children: ReactNode }) {
  const [definitions, setDefinitions] = useState<DefinitionCache>(() => getCachedDefinitions());
  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  
  const fetchingRef = useRef<Set<string>>(new Set());
  const batchQueueRef = useRef<Set<string>>(new Set());
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update cache when definitions change
  useEffect(() => {
    setCachedDefinitions(definitions);
  }, [definitions]);

  const processBatchQueue = useCallback(async () => {
    const ids = Array.from(batchQueueRef.current);
    if (ids.length === 0) return;
    
    batchQueueRef.current.clear();
    
    // Mark all as loading
    setLoading(prev => {
      const newLoading = { ...prev };
      ids.forEach(id => {
        newLoading[id] = true;
        fetchingRef.current.add(id);
      });
      return newLoading;
    });
    
    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev };
      ids.forEach(id => {
        newErrors[id] = null;
      });
      return newErrors;
    });
    
    try {
      const fetchedDefinitions = await fetchDefinitionsBatch(ids);
      
      // Update definitions
      setDefinitions(prev => {
        const newDefinitions = { ...prev };
        fetchedDefinitions.forEach(def => {
          newDefinitions[def.id] = def;
        });
        return newDefinitions;
      });
      
      // Mark any missing definitions as errors
      const fetchedIds = new Set(fetchedDefinitions.map(d => d.id));
      ids.forEach(id => {
        if (!fetchedIds.has(id)) {
          setErrors(prev => ({ ...prev, [id]: 'Definition not found' }));
        }
      });
    } catch (error) {
      console.error('Batch fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load definitions';
      setErrors(prev => {
        const newErrors = { ...prev };
        ids.forEach(id => {
          newErrors[id] = errorMessage;
        });
        return newErrors;
      });
    } finally {
      setLoading(prev => {
        const newLoading = { ...prev };
        ids.forEach(id => {
          newLoading[id] = false;
          fetchingRef.current.delete(id);
        });
        return newLoading;
      });
    }
  }, []);

  const fetchDefinition = useCallback((id: string) => {
    if (definitions[id] || fetchingRef.current.has(id)) {
      return;
    }
    
    // Add to batch queue
    batchQueueRef.current.add(id);
    
    // Clear existing timer
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }
    
    // Set new timer to process batch after 10ms
    batchTimerRef.current = setTimeout(() => {
      processBatchQueue();
    }, 10);
  }, [definitions, processBatchQueue]);

  const prefetchDefinitions = useCallback((ids: string[]) => {
    const idsToFetch = ids.filter(id => !definitions[id] && !fetchingRef.current.has(id));
    
    if (idsToFetch.length === 0) return;
    
    // Add all to batch queue
    idsToFetch.forEach(id => batchQueueRef.current.add(id));
    
    // Clear existing timer
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }
    
    // Process immediately for prefetch
    processBatchQueue();
  }, [definitions, processBatchQueue]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, []);

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