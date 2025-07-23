import { createSearchAPI } from 'fumadocs-core/search/server';
import { getArticles } from '@/lib/directus-source';
// Remove the import for now - we'll define it inline
// import type { StructuredData } from 'fumadocs-core/search';

// Cache the search indexes
let cachedIndexes: any[] | null = null;
let lastInvalidation: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create a function to get all search indexes
async function getSearchIndexes() {
  const now = Date.now();
  if (cachedIndexes && (now - lastInvalidation) < CACHE_DURATION) {
    return cachedIndexes;
  }
  
  const articles = await getArticles();
  const indexes: any[] = [];
  
  articles.forEach((article) => {
    // Extract sections from content using numbered section pattern
    const contentText = article.htmlContent || '';
    
    // Split content into chunks and look for numbered sections
    const chunks = contentText.split(/\s+/).slice(0, 500); // Limit to first 500 words for testing
    const sections: Array<{ id: string; title: string; number: string; index: number }> = [];
    
    // Helper function to generate heading ID like TOC does
    function generateHeadingId(title: string): string {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, '') // Keep alphanumeric, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .substring(0, 50); // Limit length to avoid very long IDs
    }

    // Extract actual sections from content using more specific numbered section pattern
    // Look for patterns like "4.1 PURPOSE" or "1.2 AUTHORITY" at the start of lines or after periods
    const sectionMatches = contentText.matchAll(/(?:^|\.\s+)(\d+\.\s*\d+)\s+([A-Z][A-Z\s&,().-]{4,50}?)(?=\s+[A-Z]|\s+\d|\s*\.|\s*$)/gim);
    const extractedSections = Array.from(sectionMatches).map((match) => {
      const number = match[1].trim();
      let title = match[2].trim();
      
      // Clean up title - remove trailing words that might be sentence fragments
      title = title.replace(/\s+(and|of|the|in|on|at|to|for|with|by|from)$/i, '');
      
      const fullTitle = `${number} ${title}`;
      const id = generateHeadingId(fullTitle);
      return { id, title: fullTitle, number, index: match.index || 0 };
    });
    
    // If no sections found with regex, use predefined sections for this article
    if (extractedSections.length === 0) {
      const keywordSections = [
        { number: '1.1', title: '1.1 TITLE', id: generateHeadingId('1.1 TITLE') },
        { number: '1.2', title: '1.2 AUTHORITY', id: generateHeadingId('1.2 AUTHORITY') },
        { number: '1.3', title: '1.3 PURPOSE AND INTENT', id: generateHeadingId('1.3 PURPOSE AND INTENT') },
        { number: '4.1', title: '4.1 PURPOSE', id: generateHeadingId('4.1 PURPOSE') },
        { number: '4.2', title: '4.2 USES', id: generateHeadingId('4.2 USES') },
        { number: '4.3', title: '4.3 DIMENSIONAL AND DESIGN STANDARDS', id: generateHeadingId('4.3 DIMENSIONAL AND DESIGN STANDARDS') },
      ];
      
      keywordSections.forEach((section, index) => {
        const sectionRegex = new RegExp(section.number.replace('.', '\\.'), 'gi');
        if (sectionRegex.test(contentText)) {
          sections.push({
            ...section,
            index: index * 1000
          });
        }
      });
    } else {
      sections.push(...extractedSections);
    }

    console.log(`Found ${sections.length} sections in article: ${article.title}`);

    // Create a separate index entry for each section
    sections.forEach((section, index) => {
      const nextSection = sections[index + 1];
      const startIndex = section.index;
      const endIndex = nextSection ? nextSection.index : contentText.length;
      
      const sectionText = contentText.substring(startIndex, endIndex)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Create individual index entry for this section
      indexes.push({
        title: section.title,
        description: `${article.title} - ${section.title}`,
        content: sectionText,
        url: `/articles/${article.category?.slug || 'uncategorized'}/${article.slug}#${section.id}`,
        id: `${article.slug}-${section.id}-${index}`,
        // Use the full slug path as tag for "This Article" filtering
        tag: `${article.category?.slug || 'uncategorized'}/${article.slug}`,
        // Additional metadata for grouping
        articleTitle: article.title,
        articleSlug: article.slug,
        sectionDepth: (section.number?.match(/\./g) || []).length + 1,
      });
    });

    // Also add a main entry for the full article (without a specific section)
    const fullText = article.htmlContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    indexes.push({
      title: article.title,
      description: article.description,
      content: fullText,
      url: `/articles/${article.category?.slug || 'uncategorized'}/${article.slug}`,
      id: article.slug,
      tag: `${article.category?.slug || 'uncategorized'}/${article.slug}`,
      // Additional metadata
      articleTitle: article.title,
      articleSlug: article.slug,
      isMainArticle: true,
    });
  });
  
  cachedIndexes = indexes;
  lastInvalidation = now;
  return cachedIndexes;
}

// Export the search API with dynamic index loading
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const tag = url.searchParams.get('tag'); // For filtering by article
    
    const indexes = await getSearchIndexes();
    console.log('Search indexes length:', indexes.length);
    console.log('Sample index titles:', indexes.slice(0, 5).map(i => i.title));
    
    if (!query) {
      // For debugging, return first 10 indexes when no query
      return Response.json(indexes.slice(0, 10));
    }
  
  // Filter results based on query and tag
  const filteredResults = indexes.filter(item => {
    // Text search
    const searchText = `${item.title} ${item.content} ${item.description || ''}`.toLowerCase();
    const matchesQuery = searchText.includes(query.toLowerCase());
    
    // Tag filter (for "This Article" functionality)
    const matchesTag = !tag || item.tag === tag;
    
    return matchesQuery && matchesTag;
  });
  
  // Sort by relevance (title matches first, then content matches)
  const sortedResults = filteredResults.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    const aTitleMatch = aTitle.includes(queryLower);
    const bTitleMatch = bTitle.includes(queryLower);
    
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    
    return 0;
  });
  
  return Response.json(sortedResults);
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json([], { status: 500 });
  }
}
