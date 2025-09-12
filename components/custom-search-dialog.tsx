'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, FileText, X, ChevronDown } from 'lucide-react';
import type { SharedProps } from 'fumadocs-ui/components/dialog/search';
import { highlightSearchTerms } from '@/lib/search-highlight';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  content: string;
  url: string;
  tag?: string;
  articleTitle?: string;
  articleSlug?: string;
  isMainArticle?: boolean;
}

interface GroupedResult {
  article: SearchResult;
  sections: SearchResult[];
  readTime: string;
}

// Helper function to get category name from tag
function getCategoryName(tag?: string): string {
  if (!tag) return 'Unknown Category';
  
  const categoryMap: { [key: string]: string } = {
    'uncategorized': 'Part I. Ordinance Introduction',
    'part-i-ordinance-introduction': 'Part I. Ordinance Introduction',
    'part-ii-zoning-introduction': 'Part II. Zoning Introduction', 
    'part-iii-neighborhood-zoning-districts': 'Part III. Neighborhood Zoning Districts',
    'part-iv-employment-zoning-districts': 'Part IV. Employment Zoning Districts',
    'part-v-centers-zoning-districts': 'Part V. Centers Zoning Districts',
    'part-vi-special-purpose-overlay-zoning-districts': 'Part VI. Special Purpose & Overlay Districts',
    'part-vii-uses': 'Part VII. Uses',
    'part-viii-general-development-zoning-standards': 'Part VIII. General Development Standards',
    'part-ix-stormwater': 'Part IX. Stormwater',
    'part-x-subdivision-streets-other-infrastructure': 'Part X. Subdivision & Infrastructure',
    'part-xi-administration': 'Part XI. Administration',
    'part-xii-nonconformities': 'Part XII. Nonconformities',
    'part-xiii-enforcement': 'Part XIII. Enforcement',
  };
  
  const categorySlug = tag.split('/')[0];
  return categoryMap[categorySlug] || 'Part I. Ordinance Introduction';
}

export default function CustomSearchDialog(props: SharedProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const pathname = usePathname();
  const router = useRouter();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Extract current article info
  const pathParts = pathname?.replace('/articles/', '').split('/') || [];
  const currentArticleTag = pathParts.join('/');
  const currentArticleName = pathParts[pathParts.length - 1]
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Scroll to selected item
  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.querySelector(`[data-result-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Optimized search effect with smart debouncing
  useEffect(() => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Don't search for single characters or very short queries
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let controller: AbortController | null = null;
    let loadingTimeoutId: NodeJS.Timeout;
    let searchTimeoutId: NodeJS.Timeout;

    // Show loading indicator only after 200ms of typing (prevents flashing on fast typing)
    loadingTimeoutId = setTimeout(() => {
      setLoading(true);
    }, 200);

    // Perform search after 250ms of no typing (faster for better UX)
    searchTimeoutId = setTimeout(() => {
      controller = new AbortController();

      // Build search URL with tag filter
      const searchParams = new URLSearchParams({ query: trimmedQuery });
      if (filterMode === 'current' && currentArticleTag) {
        searchParams.set('tag', currentArticleTag);
      }

      const basePath = process.env.NODE_ENV === 'production' ? '/articles' : '';
      fetch(`${basePath}/api/search?${searchParams.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Search error:', err);
            setLoading(false);
          }
        });
    }, 250);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeoutId);
      clearTimeout(searchTimeoutId);
      if (controller) {
        controller.abort();
      }
    };
  }, [query, filterMode, currentArticleTag]);

  // Group results by article
  const groupedResults = useMemo(() => {
    if (!results.length) return [];
    
    const groups = new Map<string, GroupedResult>();

    results.forEach((result) => {
      const isSection = result.url.includes('#');
      const articleUrl = isSection ? result.url.split('#')[0] : result.url;
      
      if (!groups.has(articleUrl)) {
        // Find the main article or create a placeholder
        const mainArticle = results.find(r => r.url === articleUrl && r.isMainArticle);
        
        if (!mainArticle) {
          // Create a placeholder main article from the section data
          const placeholderArticle: SearchResult = {
            id: `main-${articleUrl}`,
            title: result.articleTitle || result.title.split(' - ')[0] || 'Unknown Article',
            description: result.description,
            content: '',
            url: articleUrl,
            tag: result.tag,
            articleTitle: result.articleTitle,
            articleSlug: result.articleSlug,
            isMainArticle: true
          };
          
          groups.set(articleUrl, {
            article: placeholderArticle,
            sections: [],
            readTime: '2 min read'
          });
        } else {
          groups.set(articleUrl, {
            article: mainArticle,
            sections: [],
            readTime: '2 min read'
          });
        }
      }

      const group = groups.get(articleUrl)!;
      
      if (isSection) {
        // Only add if not already present (avoid duplicates)
        const existingSection = group.sections.find(s => s.id === result.id);
        if (!existingSection) {
          group.sections.push(result);
        }
        // Calculate read time based on content length and number of sections
        const totalSections = group.sections.length;
        group.readTime = `${Math.max(2, Math.ceil(totalSections * 0.5))} min read`;
      }
    });

    // Sort groups by number of sections (most matches first), then by article title
    const sortedGroups = Array.from(groups.values()).sort((a, b) => {
      if (b.sections.length !== a.sections.length) {
        return b.sections.length - a.sections.length;
      }
      return a.article.title.localeCompare(b.article.title);
    });
    
    // Sort sections within each group by order they appear in document
    sortedGroups.forEach(group => {
      group.sections.sort((a, b) => {
        // Sort by URL fragment (heading id) which should maintain document order
        const aFragment = a.url.split('#')[1] || '';
        const bFragment = b.url.split('#')[1] || '';
        return aFragment.localeCompare(bFragment);
      });
    });
    
    return sortedGroups;
  }, [results]);

  // Get all selectable items (articles and sections)
  const getAllSelectableItems = useMemo(() => {
    const items: Array<{ type: 'article' | 'section'; url: string; groupIndex: number; sectionIndex?: number }> = [];
    
    groupedResults.forEach((group, groupIndex) => {
      // Add the main article
      items.push({ type: 'article', url: group.article.url, groupIndex });
      
      // Add all sections
      group.sections.forEach((section, sectionIndex) => {
        items.push({ type: 'section', url: section.url, groupIndex, sectionIndex });
      });
    });
    
    return items;
  }, [groupedResults]);

  const handleSelect = (url: string) => {
    props.onOpenChange(false);
    
    // Add search term to URL for highlighting
    let urlWithSearch = url;
    if (query) {
      // Check if URL has fragment (hash)
      const [basePath, fragment] = url.split('#');
      if (fragment) {
        // Insert search parameter before fragment
        urlWithSearch = `${basePath}?search=${encodeURIComponent(query)}#${fragment}`;
      } else {
        // No fragment, just add search parameter
        urlWithSearch = `${url}?search=${encodeURIComponent(query)}`;
      }
    }
    console.log('Navigating to URL with search:', urlWithSearch);
    
    router.push(urlWithSearch);
    setQuery(''); // Clear query after navigation
  };

  // Handle keyboard navigation
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Global shortcuts
      if (!props.open) {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          props.onOpenChange(true);
        }
        return;
      }

      // Navigation within dialog
      if (props.open) {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            props.onOpenChange(false);
            break;
            
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => {
              const totalItems = getAllSelectableItems.length;
              if (totalItems === 0) return -1;
              return prev < totalItems - 1 ? prev + 1 : 0;
            });
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => {
              const totalItems = getAllSelectableItems.length;
              if (totalItems === 0) return -1;
              return prev > 0 ? prev - 1 : totalItems - 1;
            });
            break;
            
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < getAllSelectableItems.length) {
              const selectedItem = getAllSelectableItems[selectedIndex];
              handleSelect(selectedItem.url);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [props, selectedIndex, getAllSelectableItems, handleSelect]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => props.onOpenChange(false)}>
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div 
          className="w-full max-w-2xl bg-fd-card border border-fd-border rounded-lg shadow-lg"
          data-search-dialog
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="flex items-center border-b border-fd-border px-4 py-3">
            <Search className="mr-3 h-4 w-4 text-fd-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground text-fd-foreground focus:ring-0 focus:border-none"
              placeholder="Search documentation (min 2 characters)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-2 ml-4">
              <button
                className="px-2 py-1 text-xs bg-fd-primary text-fd-primary-foreground rounded border border-fd-primary hover:bg-fd-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
                onClick={() => {/* Search action */}}
              >
                Search
              </button>
              {filterMode === 'current' && currentArticleName && (
                <button
                  className="px-2 py-1 text-xs bg-fd-muted text-fd-foreground rounded border border-fd-border flex items-center gap-1 hover:bg-fd-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
                  onClick={() => setFilterMode('all')}
                >
                  Search Article {currentArticleName}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <button
              className="h-6 w-6 p-0 ml-2 rounded-md hover:bg-fd-accent flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
              onClick={() => props.onOpenChange(false)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto" ref={resultsContainerRef}>
            {loading && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-pulse">🔍</div>
                  Searching...
                </div>
              </div>
            )}

            {!loading && query && query.trim().length < 2 && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div>⌨️</div>
                  Type at least 2 characters to search
                </div>
              </div>
            )}

            {!loading && query && query.trim().length >= 2 && groupedResults.length === 0 && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div>❌</div>
                  No results found for "{query.trim()}"
                </div>
                <div className="text-xs">
                  Try different keywords or check your spelling
                </div>
              </div>
            )}

            {!loading && !query && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div>💡</div>
                  Start typing to search the documentation
                </div>
                <div className="text-xs">
                  Search articles, sections, and content
                </div>
              </div>
            )}

            {!loading && groupedResults.map((group, groupIndex) => {
              // Calculate the current item index for this article
              let currentItemIndex = 0;
              for (let i = 0; i < groupIndex; i++) {
                currentItemIndex += 1 + groupedResults[i].sections.length; // 1 for article + sections
              }
              const articleIndex = currentItemIndex;
              
              return (
              <div key={group.article.url} className="border-b border-fd-border last:border-0">
                {/* Article Header */}
                <div 
                  className={`p-4 ${selectedIndex === articleIndex ? 'bg-fd-accent/50' : ''}`}
                  data-result-index={articleIndex}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="p-1.5 bg-fd-primary/10 rounded">
                        <FileText className="h-3 w-3 text-fd-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-fd-primary font-medium">
                        <span>Article</span>
                        {group.sections.length > 0 && (
                          <span className="bg-fd-accent text-fd-accent-foreground px-1.5 py-0.5 rounded font-semibold">
                            {group.sections.length} instances
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelect(group.article.url)}
                        onMouseEnter={() => setSelectedIndex(articleIndex)}
                        className="block mt-1 text-left hover:text-fd-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 rounded"
                      >
                        <h3 
                          className="font-semibold text-base text-fd-foreground"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightSearchTerms(group.article.title, query) 
                          }}
                        />
                      </button>
                      <div className="flex items-center gap-2 text-sm text-fd-muted-foreground mt-1">
                        <span>{getCategoryName(group.article.tag)}</span>
                        <span>•</span>
                        <button
                          onClick={() => handleSelect(group.article.url)}
                          className="text-fd-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 rounded"
                        >
                          View article →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Results */}
                {group.sections.map((section, sectionIndex) => {
                  const sectionTitle = section.title.includes(' - ') 
                    ? section.title.split(' - ').slice(1).join(' - ')
                    : section.title;
                  
                  const readTime = `${Math.max(2, sectionIndex + 2)} min read`;
                  const sectionItemIndex = articleIndex + 1 + sectionIndex;

                  return (
                    <div 
                      key={section.id} 
                      className={`px-4 py-3 ml-12 border-l-2 border-l-fd-primary ${selectedIndex === sectionItemIndex ? 'bg-fd-accent' : ''}`}
                      data-result-index={sectionItemIndex}
                    >
                      <button
                        onClick={() => handleSelect(section.url)}
                        onMouseEnter={() => setSelectedIndex(sectionItemIndex)}
                        className="w-full text-left hover:bg-fd-accent/50 p-2 -m-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-medium text-sm text-fd-foreground"
                              dangerouslySetInnerHTML={{ 
                                __html: highlightSearchTerms(sectionTitle, query) 
                              }}
                            />
                            {section.content && (
                              <div 
                                className="text-sm text-fd-muted-foreground mt-1 line-clamp-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightSearchTerms(section.content.substring(0, 120) + '...', query)
                                }}
                              />
                            )}
                          </div>
                          <div className="text-xs text-fd-muted-foreground ml-3 flex-shrink-0 bg-fd-muted px-2 py-1 rounded">
                            {readTime}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-fd-border px-4 py-3 bg-fd-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-sm text-fd-muted-foreground">Filter:</span>
              <div className="relative">
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as 'all' | 'current')}
                  className="appearance-none text-sm border border-fd-border rounded-md px-3 py-1.5 pr-8 bg-fd-card hover:bg-fd-accent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 text-fd-foreground"
                >
                  <option value="all">All Articles</option>
                  {pathname?.startsWith('/articles/') && pathname !== '/articles' && currentArticleName && (
                    <option value="current">Article {currentArticleName}</option>
                  )}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-fd-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-fd-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-fd-border bg-fd-card px-1.5 font-mono text-[10px] font-medium">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-fd-border bg-fd-card px-1.5 font-mono text-[10px] font-medium">
                  ↵
                </kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-fd-border bg-fd-card px-1.5 font-mono text-[10px] font-medium">
                  Esc
                </kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}