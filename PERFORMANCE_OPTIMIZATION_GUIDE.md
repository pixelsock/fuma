# Performance Optimization Guide

This guide explains the performance optimizations implemented to prevent table flashing and optimize definition prefetching in the Charlotte UDO documentation site.

## Overview

The performance optimizations address two main issues:
1. **Table Flashing** - Tables appearing unstyled before AG-Grid renders them
2. **Definition Loading Delays** - 500ms delay before definitions start prefetching

## Components Created

### 1. UDOContentRendererV4 (`components/udo-content-renderer-v4.tsx`)

An optimized content renderer that prevents table flashing through:
- **Progressive Loading**: Tables show loading skeletons until ready
- **Reserved Space**: Calculates table height based on row count to prevent layout shifts
- **Smooth Transitions**: Opacity transitions for seamless loading
- **Performance Optimization**: Uses `requestIdleCallback` for non-blocking updates

Key features:
```typescript
// Tables are extracted and replaced with placeholders
const minHeight = Math.max(200, rows * 40); // Dynamic height based on content
placeholder.style.minHeight = `${minHeight}px`;

// onReady callback for precise loading control
handleTableReady(index);
```

### 2. Enhanced Definition Prefetcher (`components/definition-prefetcher.tsx`)

Optimized prefetching with:
- **Immediate Loading**: Removed 500ms delay
- **Viewport-Based**: Uses Intersection Observer for intelligent prefetching
- **Scroll Optimization**: Throttled scroll handler for additional prefetching
- **Duplicate Prevention**: Tracks prefetched definitions to avoid redundant calls

```typescript
// Prefetch immediately on mount
prefetchVisibleDefinitions();

// Intersection Observer with 200px margin
rootMargin: '200px'
```

### 3. DefinitionDataContextV2 (`components/definition-data-context-v2.tsx`)

Optimized data context with:
- **Batch Fetching**: Groups multiple definition requests into single API call
- **Session Storage Caching**: 1-hour TTL for improved performance
- **Queue System**: 10ms delay to enable request batching

```typescript
// Batch fetch multiple definitions
const filter = { id: { _in: ids } };

// Session storage caching
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
```

### 4. Loading States (`app/articles/[[...slug]]/loading.tsx`)

Provides immediate feedback during page loads with:
- Article header skeleton
- Content skeleton with appropriate spacing
- Table placeholder matching actual table appearance

## CSS Optimizations (`app/global.css`)

Performance-focused CSS additions:
```css
/* Table loading states */
.table-loading-placeholder {
  position: relative;
  overflow: hidden;
}

.table-skeleton {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

/* Smooth transitions */
.table-container > div {
  transition: opacity 0.3s ease-out;
}
```

## Integration Guide

### Option 1: Using UDOContentRendererV4 (Client-Side)

For client-side table processing:

```tsx
import { UDOContentRendererV4 } from '@/components/udo-content-renderer-v4';
import { DefinitionDataProvider } from '@/components/definition-data-context-v2';
import { DefinitionPrefetcher } from '@/components/definition-prefetcher';

<DefinitionDataProvider>
  <UDOContentRendererV4 
    htmlContent={content}
  />
  <DefinitionPrefetcher />
</DefinitionDataProvider>
```

### Option 2: TanStack Table Renderer (Current Implementation)

The production renderer now streams through the TanStack-powered implementation, which no longer requires server-side preprocessing:

```tsx
import { UDOContentRendererV3Optimized } from '@/components/udo-content-renderer-v3-optimized';

<UDOContentRendererV3Optimized 
  htmlContent={directusPage.data.content || ''}
/>
```

## Performance Improvements

### Before Optimization
- Tables flash unstyled content before AG-Grid renders
- 500ms delay before definition prefetching starts
- Individual API calls for each definition
- No caching between page navigations

### After Optimization
- Tables show smooth loading skeletons
- Definitions prefetch immediately on page load
- Batch API calls reduce server load
- Session storage caching improves repeat visits
- No layout shifts or content flashing

## Testing

Visit `/test-performance-v2` to see a side-by-side comparison of:
- Original renderer (V3) vs Optimized renderer (V4)
- Performance improvements in action

## Monitoring

The optimizations include performance tracking:
- Custom events: `table-render-start` and `table-render-end`
- Console logging of render times
- Visual feedback through loading states

## Future Enhancements

1. **Preload Critical Definitions**: Analyze content to preload most-used definitions
2. **Progressive Enhancement**: Start with simple tables, enhance to AG-Grid
3. **Service Worker Caching**: Cache definition data for offline support
4. **Virtual Scrolling**: For very large tables
5. **Predictive Prefetching**: Use ML to predict which definitions users will hover over
