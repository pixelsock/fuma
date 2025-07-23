'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, FileText, X, ChevronDown } from 'lucide-react';
// Using standard HTML button instead of fumadocs button component

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

interface CustomSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to get category name from tag
function getCategoryName(tag?: string): string {
  if (!tag) return 'Unknown Category';
  
  const categoryMap: { [key: string]: string } = {
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
  return categoryMap[categorySlug] || 'Unknown Category';
}

export function SearchCustomGrouped({ open, onOpenChange }: CustomSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'current'>('all');
  const pathname = usePathname();
  const router = useRouter();

  // Extract current article info
  const pathParts = pathname?.replace('/articles/', '').split('/') || [];
  const currentArticleTag = pathParts.join('/');
  const currentArticleName = pathParts[pathParts.length - 1]
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  // Open search with Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // Fetch search results
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    // Build search URL with tag filter
    const searchParams = new URLSearchParams({ query });
    if (filterMode === 'current' && currentArticleTag) {
      searchParams.set('tag', currentArticleTag);
    }

    fetch(`/api/search?${searchParams.toString()}`, {
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

    return () => controller.abort();
  }, [query, filterMode, currentArticleTag]);

  // Group results by article
  const groupedResults = useMemo(() => {
    if (!results.length) return [];
    
    console.log('Search results:', results);
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
        group.sections.push(result);
        // Calculate read time based on content length and number of sections
        const totalSections = group.sections.length;
        group.readTime = `${Math.max(2, Math.ceil(totalSections * 0.5))} min read`;
      }
    });

    const sortedGroups = Array.from(groups.values()).sort((a, b) => 
      b.sections.length - a.sections.length
    );
    
    console.log('Grouped results:', sortedGroups);
    return sortedGroups;
  }, [results]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div 
          className="w-full max-w-2xl bg-fd-background border border-fd-border rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="flex items-center border-b border-fd-border px-4 py-3">
            <Search className="mr-3 h-4 w-4 text-fd-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-fd-muted-foreground text-fd-foreground"
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              className="h-6 w-6 p-0 ml-2 rounded-md hover:bg-fd-accent flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && query && groupedResults.length === 0 && (
              <div className="py-8 text-center text-sm text-fd-muted-foreground">
                No results found.
              </div>
            )}

            {!loading && groupedResults.map((group, groupIndex) => (
              <div key={group.article.url} className="border-b border-fd-border last:border-0">
                {/* Article Header */}
                <button
                  onClick={() => handleSelect(group.article.url)}
                  className="w-full text-left px-4 py-3 hover:bg-fd-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-fd-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-fd-foreground">{group.article.title}</div>
                      <div className="flex items-center gap-2 text-xs text-fd-muted-foreground mt-1">
                        <span>{getCategoryName(group.article.tag)}</span>
                        <span>•</span>
                        <span className="text-fd-primary">View article →</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Instance Badge */}
                {group.sections.length > 0 && (
                  <div className="px-4 pb-2">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-fd-accent text-fd-accent-foreground text-xs rounded-md font-medium">
                      <FileText className="h-3 w-3" />
                      <span>{group.sections.length} instance{group.sections.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}

                {/* Section Results */}
                {group.sections.map((section, sectionIndex) => {
                  const sectionTitle = section.title.includes(' - ') 
                    ? section.title.split(' - ').slice(1).join(' - ')
                    : section.title;
                  
                  const readTime = `${Math.max(2, sectionIndex + 2)} min read`;

                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSelect(section.url)}
                      className="w-full text-left px-4 py-3 pl-12 hover:bg-fd-accent/50 transition-colors border-l-2 border-l-fd-primary ml-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-fd-foreground">{sectionTitle}</div>
                          {section.content && (
                            <div className="text-xs text-fd-muted-foreground mt-1 line-clamp-2">
                              {section.content.substring(0, 120)}...
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-fd-muted-foreground ml-3 flex-shrink-0">
                          {readTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-fd-border px-4 py-3 bg-fd-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-sm text-fd-muted-foreground">Filter:</span>
              <div className="relative">
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as 'all' | 'current')}
                  className="appearance-none text-sm border border-fd-border rounded-md px-3 py-1.5 pr-8 bg-fd-background hover:bg-fd-accent cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 text-fd-foreground"
                >
                  <option value="all">All Articles</option>
                  {pathname?.startsWith('/articles/') && pathname !== '/articles' && currentArticleName && (
                    <option value="current">Article {currentArticleName}</option>
                  )}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-fd-muted-foreground" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-fd-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-fd-border bg-fd-muted px-1.5 font-mono text-[10px] font-medium">
                  ↵
                </kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-fd-border bg-fd-muted px-1.5 font-mono text-[10px] font-medium">
                  Esc
                </kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}