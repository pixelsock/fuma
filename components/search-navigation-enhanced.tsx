'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function SearchNavigationEnhanced() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const searchTerm = searchParams?.get('search') || '';

  // Monitor for highlights on the page
  useEffect(() => {
    console.log('SearchNavigationEnhanced useEffect - searchTerm:', searchTerm);
    
    if (!searchTerm) {
      setTotalResults(0);
      setCurrentIndex(0);
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
          // Scroll to first result with offset
          const element = highlights[0] as HTMLElement;
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const offset = 120; // Offset to account for fixed header
          
          window.scrollTo({
            top: absoluteElementTop - offset,
            behavior: 'smooth'
          });
          
          element.classList.add('ring-2', 'ring-fd-primary');
        }
      }
    };

    // Initial check
    const initialTimer = setTimeout(checkHighlights, 200);

    // Set up periodic checks
    const interval = setInterval(checkHighlights, 500);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [searchTerm, pathname, totalResults, currentIndex]);

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
      
      // Add new styling and scroll with offset
      const element = highlights[index] as HTMLElement;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const offset = 120; // Offset to account for fixed header
      
      window.scrollTo({
        top: absoluteElementTop - offset,
        behavior: 'smooth'
      });
      
      element.classList.add('ring-2', 'ring-fd-primary');
      setCurrentIndex(index);
    }
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
      <div className="p-4">
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
    </div>
  );
}