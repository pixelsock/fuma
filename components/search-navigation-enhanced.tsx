'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface Article {
  id: string;
  name: string;
  slug: string;
  count: number;
  snippet: string;
}

export function SearchNavigationEnhanced() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [showArticles, setShowArticles] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const searchTerm = searchParams?.get('search') || '';

  // Get current article slug from pathname
  const currentSlug = pathname?.split('/').pop() || '';

  // Monitor for highlights on the page
  useEffect(() => {
    console.log('SearchNavigationEnhanced useEffect - searchTerm:', searchTerm);
    
    if (!searchTerm) {
      setTotalResults(0);
      setCurrentIndex(0);
      setOtherArticles([]);
      return;
    }

    // Poll for highlights since they're added by HighlightedContent component
    const checkHighlights = () => {
      const highlights = document.querySelectorAll('.search-highlight');
      const count = highlights.length;
      
      console.log('SearchNavigationEnhanced - Found highlights:', count);
      
      if (count !== totalResults) {
        setTotalResults(count);
        if (count > 0 && currentIndex === 0) {
          // Scroll to first result
          highlights[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          highlights[0].classList.add('ring-2', 'ring-fd-primary');
        }
      }
    };

    // Initial check
    const initialTimer = setTimeout(checkHighlights, 200);

    // Set up periodic checks
    const interval = setInterval(checkHighlights, 500);

    // Fetch other articles with the search term
    fetchOtherArticles();

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [searchTerm, pathname, totalResults, currentIndex]);

  // Fetch articles containing the search term
  const fetchOtherArticles = async () => {
    if (!searchTerm) return;
    
    setLoadingArticles(true);
    try {
      // Get base path from config for API calls
      const basePath = process.env.NODE_ENV === 'production' ? '/articles' : '';
      const response = await fetch(`${basePath}/api/search-articles?q=${encodeURIComponent(searchTerm)}&current=${encodeURIComponent(currentSlug)}`);
      if (response.ok) {
        const data = await response.json();
        setOtherArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoadingArticles(false);
  };

  // Navigate to previous result
  const goToPrevious = () => {
    if (totalResults === 0) return;
    const newIndex = currentIndex === 0 ? totalResults - 1 : currentIndex - 1;
    navigateToHighlight(newIndex);
  };

  // Navigate to next result
  const goToNext = () => {
    if (totalResults === 0) return;
    const newIndex = currentIndex === totalResults - 1 ? 0 : currentIndex + 1;
    navigateToHighlight(newIndex);
  };

  const navigateToHighlight = (index: number) => {
    const highlights = document.querySelectorAll('.search-highlight');
    if (highlights[index]) {
      // Remove previous styling
      highlights.forEach(h => h.classList.remove('ring-2', 'ring-fd-primary'));
      
      // Add new styling and scroll
      highlights[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      highlights[index].classList.add('ring-2', 'ring-fd-primary');
      setCurrentIndex(index);
    }
  };

  // Navigate to another article
  const navigateToArticle = (slug: string) => {
    const newUrl = `/articles/${slug}?search=${encodeURIComponent(searchTerm || '')}`;
    router.push(newUrl);
  };

  // Close search navigation
  const closeSearch = () => {
    // Remove all highlight styling
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(h => h.classList.remove('ring-2', 'ring-fd-primary'));
    
    // Remove search parameter from URL
    const newSearchParams = new URLSearchParams(searchParams || undefined);
    newSearchParams.delete('search');
    const newUrl = newSearchParams.toString() 
      ? `${pathname}?${newSearchParams.toString()}`
      : pathname;
    
    router.replace(newUrl || '/');
  };

  // Don't render if no search term
  if (!searchTerm) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-fd-card border border-fd-border rounded-lg shadow-lg min-w-[320px] max-w-[400px]">
      {/* Main search navigation */}
      <div className="p-4 border-b border-fd-border">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-sm text-fd-muted-foreground">
              Searching for: <strong className="text-fd-foreground">"{searchTerm}"</strong>
            </div>
            {totalResults > 0 && (
              <div className="text-xs text-fd-muted-foreground mt-1">
                <span className="text-fd-accent-foreground font-medium">{currentIndex + 1}</span> of <span className="text-fd-accent-foreground font-medium">{totalResults}</span> in this article
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevious}
              disabled={totalResults === 0}
              className="p-1.5 rounded hover:bg-fd-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
              aria-label="Previous result"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={goToNext}
              disabled={totalResults === 0}
              className="p-1.5 rounded hover:bg-fd-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
              aria-label="Next result"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={closeSearch}
              className="p-1.5 rounded hover:bg-fd-accent transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Other articles section */}
      <div className="border-t border-fd-border">
        <button
          onClick={() => setShowArticles(!showArticles)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-fd-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset"
        >
          <span className="text-sm font-medium text-fd-foreground">
            Other articles ({loadingArticles ? '...' : <span className="text-fd-accent-foreground">{otherArticles.length}</span>})
          </span>
          {showArticles ? (
            <ChevronUp className="h-4 w-4 text-fd-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-fd-muted-foreground" />
          )}
        </button>
        
        {showArticles && (
          <div className="max-h-64 overflow-y-auto">
            {loadingArticles ? (
              <div className="px-4 py-3 text-sm text-fd-muted-foreground">Loading...</div>
            ) : otherArticles.length > 0 ? (
              <div className="py-2">
                {otherArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => navigateToArticle(article.slug)}
                    className="w-full px-4 py-2 text-left hover:bg-fd-accent transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-fd-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-fd-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-fd-foreground group-hover:text-fd-primary truncate">
                          {article.name}
                        </div>
                        <div className="text-xs text-fd-accent-foreground">
                          {article.count} occurrence{article.count !== 1 ? 's' : ''}
                        </div>
                        {article.snippet && (
                          <div className="text-xs text-fd-muted-foreground mt-1 line-clamp-2">
                            {article.snippet}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-fd-muted-foreground">
                No other articles found with "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}