import { getArticleBySlug, getArticles, generateArticleParams, getCategories } from './directus-source';
import type { TableOfContents } from 'fumadocs-core/server';

// Define TOC item type to match Fumadocs expectations
type TOCItem = {
  title: string;
  url: string;
  depth: number;
}

interface ProcessedContent {
  htmlParts: string[];
  tables: string[];
}

/**
 * Generates a clean ID from heading text
 */
function generateHeadingId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, '') // Keep alphanumeric, spaces, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to avoid very long IDs
}

/**
 * Adds IDs to HTML headings to match TOC links
 */
function addHeadingIds(htmlContent: string): string {
  if (!htmlContent) return htmlContent;
  
  return htmlContent.replace(/<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, tagName, attributes, titleHTML) => {
    // Check if heading already has an ID
    const hasId = /\s+id\s*=\s*["\'][^"\']*["\']/.test(attributes);
    if (hasId) return match;
    
    // Extract text content from HTML (remove any tags)
    const title = titleHTML.replace(/<[^>]*>/g, '').trim();
    if (!title) return match;
    
    // Generate ID
    const id = generateHeadingId(title);
    
    // Add ID to the heading
    return `<${tagName}${attributes} id="${id}">${titleHTML}</${tagName}>`;
  });
}

/**
 * Extracts tables from HTML content and returns processed content with table placeholders
 */
function extractTablesFromHTML(htmlContent: string): ProcessedContent {
  if (!htmlContent) return { htmlParts: [htmlContent], tables: [] };
  
  console.log('Starting table extraction...');
  
  // Simple regex-based table extraction for server-side processing
  const tableRegex = /<table[^>]*>.*?<\/table>/gis;
  const tables: string[] = [];
  let lastIndex = 0;
  const htmlParts: string[] = [];
  
  let match;
  let tableCount = 0;
  
  while ((match = tableRegex.exec(htmlContent)) !== null) {
    console.log(`Found table ${tableCount + 1} at index ${match.index}`);
    
    // Add content before the table
    if (match.index > lastIndex) {
      const beforeTable = htmlContent.substring(lastIndex, match.index);
      htmlParts.push(beforeTable);
      console.log(`Added content part ${htmlParts.length - 1}: ${beforeTable.length} chars`);
    }
    
    // Add table placeholder
    const placeholder = `<!--TABLE_PLACEHOLDER_${tables.length}-->`;
    htmlParts.push(placeholder);
    tables.push(match[0]);
    
    console.log(`Added table ${tables.length - 1}: ${match[0].length} chars`);
    console.log(`Added placeholder: ${placeholder}`);
    
    lastIndex = match.index + match[0].length;
    tableCount++;
  }
  
  // Add remaining content after last table
  if (lastIndex < htmlContent.length) {
    const afterTables = htmlContent.substring(lastIndex);
    htmlParts.push(afterTables);
    console.log(`Added final content part: ${afterTables.length} chars`);
  }
  
  // If no tables found, return original content
  if (tables.length === 0) {
    console.log('No tables found, returning original content');
    return { htmlParts: [htmlContent], tables: [] };
  }
  
  console.log(`Table extraction complete: ${tables.length} tables, ${htmlParts.length} parts`);
  return { htmlParts, tables };
}

/**
 * Generates Table of Contents from HTML content by extracting headings
 */
function generateTOCFromHTML(htmlContent: string): TableOfContents {
  if (!htmlContent) return [];
  
  try {
    // Use a simple regex approach since we're in Node.js environment
    const headingRegex = /<(h[1-6])[^>]*(?:\s+id\s*=\s*["\']([^"\']*)["\'])?[^>]*>(.*?)<\/h[1-6]>/gi;
    const toc: TableOfContents = [];
    let match;
    
    while ((match = headingRegex.exec(htmlContent)) !== null) {
      const tagName = match[1]; // h1, h2, etc.
      const existingId = match[2]; // existing id attribute if present
      const titleHTML = match[3]; // content inside heading tag
      
      // Extract text content from HTML (remove any tags)
      const title = titleHTML.replace(/<[^>]*>/g, '').trim();
      if (!title) continue;
      
      // Generate or use existing id
      const id = existingId || generateHeadingId(title);
      
      const depth = parseInt(tagName.charAt(1));
      
      toc.push({
        title,
        url: `#${id}`,
        depth
      });
    }
    
    console.log(`Generated TOC with ${toc.length} items for article`);
    return toc;
  } catch (error) {
    console.error('Error generating TOC from HTML:', error);
    return [];
  }
}

/**
 * Generates a nested URL path from a flat article slug
 * Maps articles to their appropriate sections based on article number
 */
function generateNestedPath(articleSlug: string): string {
  // Extract article number from slug
  const match = articleSlug.match(/^article-(\d+)/);
  if (!match) {
    return articleSlug; // Return as-is if no article number found
  }
  
  const articleNumber = parseInt(match[1], 10);
  
  // Map article numbers to their sections
  if (articleNumber >= 1 && articleNumber <= 2) {
    return `part-i-ordinance-introduction/${articleSlug}`;
  } else if (articleNumber === 3) {
    return `part-ii-zoning-introduction/${articleSlug}`;
  } else if (articleNumber >= 4 && articleNumber <= 5) {
    return `part-iii-neighborhood-zoning-districts/${articleSlug}`;
  } else if (articleNumber >= 6 && articleNumber <= 9) {
    return `part-iv-employment-zoning-districts/${articleSlug}`;
  } else if (articleNumber >= 10 && articleNumber <= 13) {
    return `part-v-centers-zoning-districts/${articleSlug}`;
  } else if (articleNumber === 14) {
    return `part-vi-special-purpose-overlay-zoning-districts/${articleSlug}`;
  } else if (articleNumber === 15) {
    return `part-vii-uses/${articleSlug}`;
  } else if (articleNumber >= 16 && articleNumber <= 22) {
    return `part-viii-general-development-zoning-standards/${articleSlug}`;
  } else if (articleNumber >= 23 && articleNumber <= 28) {
    return `part-ix-stormwater/${articleSlug}`;
  } else if (articleNumber >= 29 && articleNumber <= 34) {
    return `part-x-subdivision-streets-other-infrastructure/${articleSlug}`;
  } else if (articleNumber >= 35 && articleNumber <= 37) {
    return `part-xi-administration/${articleSlug}`;
  } else if (articleNumber === 38) {
    return `part-xii-nonconformities/${articleSlug}`;
  } else if (articleNumber === 39) {
    return `part-xiii-enforcement/${articleSlug}`;
  }
  
  // Default: return as-is
  return articleSlug;
}

import React from 'react';

// Helper function to get categories with articles
async function getCategoriesWithArticles() {
  try {
    const articles = await getArticles();
    const categories = await getCategories();
    
    const categoryMap = new Map<string, {
      name: string;
      slug: string;
      description: string;
      articles: Array<{
        name: string;
        slug: string;
        url: string;
      }>;
    }>();

    // Initialize categories from Directus
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        articles: []
      });
    });

    // Track uncategorized articles
    const uncategorizedArticles: Array<{
      name: string;
      slug: string;
      url: string;
    }> = [];

    // Group articles by category
    articles.forEach(article => {
      let categorized = false;
      
      // Check if article has a category
      // The category field from Directus is a JSON object with 'key' containing the category ID
      if (article.category) {
        let categoryId: string | undefined;
        
        // Handle different category data structures
        if (typeof article.category === 'object' && 'key' in article.category) {
          // Raw format from Directus: { key: 'category-id', collection: 'article_categories' }
          categoryId = (article.category as any).key;
        } else if (typeof article.category === 'object' && 'id' in article.category) {
          // Already processed format: { id: 'category-id', name: '...', ... }
          categoryId = (article.category as any).id;
        }
        
        if (categoryId) {
          const category = categoryMap.get(categoryId);
          if (category) {
            const nestedPath = generateNestedPath(article.slug);
            category.articles.push({
              name: article.name,
              slug: article.slug,
              url: nestedPath.includes('/') ? `/articles/${nestedPath}` : `/articles/${category.slug}/${article.slug}`
            });
            categorized = true;
          }
        }
      }
      
      // If not categorized yet, try the article number pattern
      if (!categorized) {
        const nestedPath = generateNestedPath(article.slug);
        if (nestedPath.includes('/')) {
          // Article was categorized by generateNestedPath
          const categorySlug = nestedPath.split('/')[0];
          const category = Array.from(categoryMap.values()).find(cat => cat.slug === categorySlug);
          if (category) {
            category.articles.push({
              name: article.name,
              slug: article.slug,
              url: `/articles/${nestedPath}`
            });
            categorized = true;
          }
        }
      }
      
      // If still not categorized, add to uncategorized
      if (!categorized) {
        uncategorizedArticles.push({
          name: article.name,
          slug: article.slug,
          url: `/articles/${article.slug}`
        });
      }
    });

    // Get categories that have articles
    const categoriesWithArticles = Array.from(categoryMap.values()).filter(cat => cat.articles.length > 0);
    
    // Add uncategorized section if there are any uncategorized articles
    if (uncategorizedArticles.length > 0) {
      categoriesWithArticles.push({
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Articles not assigned to a specific part',
        articles: uncategorizedArticles
      });
    }

    return categoriesWithArticles;
  } catch (error) {
    console.error('Error getting categories with articles:', error);
    return [];
  }
}

// Initialize the page tree cache on module load
let initializing = false;
async function initializePageTree() {
  if (initializing) return;
  initializing = true;
  try {
    // Force refresh the cache
    directusOnlySource._pageTreeCacheTime = 0;
    await directusOnlySource.getPageTree();
    console.log('[directus-only-source] Page tree initialized with', directusOnlySource._pageTreeCache?.children?.length || 0, 'categories');
  } catch (error) {
    console.error('[directus-only-source] Failed to initialize page tree:', error);
  }
}

// Simple source that only handles Directus content
export const directusOnlySource = {
  async getPage(slugs: string[]) {
    try {
      const slug = slugs?.join('/') || '';
      const article = await getArticleBySlug(slug);
      
      if (article) {
        console.log('Processing article:', article.name);
        console.log('Article has htmlContent:', !!article.htmlContent);
        console.log('Article htmlContent length:', article.htmlContent?.length || 0);
        
        // Use the raw HTML content and add IDs to headings
        const rawHtmlContent = article.htmlContent || '';
        const htmlContent = addHeadingIds(rawHtmlContent);
        
        // Temporarily disable table extraction to fix hydration issues
        // const processedContent = extractTablesFromHTML(htmlContent);
        
        // Generate TOC from the HTML content
        const toc = generateTOCFromHTML(htmlContent);
        
        return {
          file: {
            path: `docs/${slug}.mdx`,
            name: article.name,
            flattenedPath: slug,
            ext: '.mdx',
            dirname: slugs.slice(0, -1).join('/') || '.',
          },
          data: {
            title: article.name,
            description: article.description,
            body: htmlContent,
            toc: toc,
            structuredData: [],
            _exports: {},
            content: htmlContent,
            full: false,
            pdf: article.pdf, // Include PDF field
            category: article.category, // Add category information
            // Temporarily disable table data to fix hydration
            tables: [],
          },
          url: `/articles/${slug}`,
          slugs: slugs,
        };
      }
    } catch (error) {
      console.error('Error fetching from Directus:', error);
    }
    
    return null;
  },
  
  async getPages() {
    try {
      const articles = await getArticles();
      return articles.map(article => {
        const nestedPath = generateNestedPath(article.slug);
        return {
          file: {
            path: `docs/${nestedPath}.mdx`,
            name: article.name,
            flattenedPath: nestedPath,
            ext: '.mdx',
            dirname: nestedPath.split('/').slice(0, -1).join('/') || '.',
          },
          data: {
            title: article.name,
            description: article.description,
            body: null, // Will be compiled on demand
            toc: [],
            structuredData: [],
            _exports: {},
            content: article.htmlContent,
            full: false,
            pdf: article.pdf, // Include PDF field
          },
          url: `/articles/${nestedPath}`,
          slugs: nestedPath.split('/'),
        };
      });
    } catch (error) {
      console.error('Error fetching pages from Directus:', error);
      return [];
    }
  },
  
  async generateParams() {
    try {
      return await generateArticleParams();
    } catch (error) {
      console.error('Error generating params:', error);
      return [];
    }
  },
  
  // Cache for the dynamic page tree
  _pageTreeCache: null as any,
  _pageTreeCacheTime: 0,
  
  async getPageTree() {
    // Return cached tree if it's less than 30 seconds old
    const now = Date.now();
    if (this._pageTreeCache && (now - this._pageTreeCacheTime) < 30 * 1000) {
      return this._pageTreeCache;
    }
    
    try {
      // Get categories with their articles from Directus
      const categoriesWithArticles = await getCategoriesWithArticles();
      
      // Define the order of parts for the UDO
      const partOrder = [
        'part-i-ordinance-introduction',
        'part-ii-zoning-introduction',
        'part-iii-neighborhood-zoning-districts',
        'part-iv-employment-zoning-districts',
        'part-v-centers-zoning-districts',
        'part-vi-special-purpose-overlay-zoning-districts',
        'part-vii-uses',
        'part-viii-general-development-zoning-standards',
        'part-ix-stormwater',
        'part-x-subdivision-streets-other-infrastructure',
        'part-xi-administration',
        'part-xii-nonconformities',
        'part-xiii-enforcement'
      ];
      
      // Map category slugs to their display names
      const categoryDisplayNames: Record<string, string> = {
        'part-i-ordinance-introduction': 'Part I: Ordinance Introduction',
        'part-ii-zoning-introduction': 'Part II: Zoning Introduction',
        'part-iii-neighborhood-zoning-districts': 'Part III: Neighborhood Zoning Districts',
        'part-iv-employment-zoning-districts': 'Part IV: Employment Zoning Districts',
        'part-v-centers-zoning-districts': 'Part V: Centers Zoning Districts',
        'part-vi-special-purpose-overlay-zoning-districts': 'Part VI: Special Purpose & Overlay Zoning Districts',
        'part-vii-uses': 'Part VII: Uses',
        'part-viii-general-development-zoning-standards': 'Part VIII: General Development & Zoning Standards',
        'part-ix-stormwater': 'Part IX: Stormwater',
        'part-x-subdivision-streets-other-infrastructure': 'Part X: Subdivision, Streets, & Other Infrastructure',
        'part-xi-administration': 'Part XI: Administration',
        'part-xii-nonconformities': 'Part XII: Nonconformities',
        'part-xiii-enforcement': 'Part XIII: Enforcement'
      };
      
      // Build the tree structure
      const children: any[] = [];
      
      // Process categories in the defined order
      for (const categorySlug of partOrder) {
        const category = categoriesWithArticles.find(cat => cat.slug === categorySlug);
        if (category && category.articles.length > 0) {
          // Sort articles by their article number if possible
          const sortedArticles = [...category.articles].sort((a, b) => {
            // Extract article numbers from slugs
            const aMatch = a.slug.match(/article-(\d+)/);
            const bMatch = b.slug.match(/article-(\d+)/);
            if (aMatch && bMatch) {
              return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return a.name.localeCompare(b.name);
          });
          
          children.push({
            type: 'folder',
            name: categoryDisplayNames[categorySlug] || category.name,
            children: sortedArticles.map(article => ({
              type: 'page',
              name: article.name,
              url: article.url
            }))
          });
        }
      }
      
      // Add any categories not in the predefined order (like test articles)
      const processedSlugs = new Set(partOrder);
      for (const category of categoriesWithArticles) {
        if (!processedSlugs.has(category.slug) && category.articles.length > 0) {
          children.push({
            type: 'folder',
            name: category.name,
            children: category.articles.map(article => ({
              type: 'page',
              name: article.name,
              url: article.url
            }))
          });
        }
      }
      
      const pageTree = {
        name: 'Charlotte UDO',
        children
      };
      
      // Cache the result
      this._pageTreeCache = pageTree;
      this._pageTreeCacheTime = now;
      
      return pageTree;
    } catch (error) {
      console.error('Error generating dynamic page tree:', error);
      // Fall back to a static tree if there's an error
      return this.getStaticPageTree();
    }
  },
  
  // Synchronous getter for compatibility
  get pageTree() {
    // Return cached tree if available, otherwise return static tree
    if (this._pageTreeCache) {
      return this._pageTreeCache;
    }
    return this.getStaticPageTree();
  },
  
  // Keep the static tree as a fallback
  getStaticPageTree() {
    return {
      name: 'Charlotte UDO',
      children: [
        {
          type: 'folder',
          name: 'Part I: Ordinance Introduction',
          children: [
            { type: 'page', name: 'Article 1. Title, Purpose, & Applicability', url: '/articles/part-i-ordinance-introduction/article-1-title-purpose-applicability' },
            { type: 'page', name: 'Article 2. Rules of Construction, Abbreviations, & Definitions', url: '/articles/part-i-ordinance-introduction/article-2-rules-of-construction-abbreviations-definitions' }
          ]
        },
        {
          type: 'folder',
          name: 'Part II: Zoning Introduction',
          children: [
            { type: 'page', name: 'Article 3. Zoning Districts, Official Zoning Map, & Frontages', url: '/articles/part-ii-zoning-introduction/article-3-zoning-districts-official-zoning-map-frontages' }
          ]
        },
        {
          type: 'folder',
          name: 'Part III: Neighborhood Zoning Districts',
          children: [
            { type: 'page', name: 'Article 4. Neighborhood 1 Zoning Districts', url: '/articles/part-iii-neighborhood-zoning-districts/article-4-neighborhood-1-zoning-districts' },
            { type: 'page', name: 'Article 5. Neighborhood 2 Zoning Districts', url: '/articles/part-iii-neighborhood-zoning-districts/article-5-neighborhood-2-zoning-districts' }
          ]
        },
        {
          type: 'folder',
          name: 'Part IV: Employment Zoning Districts',
          children: [
            { type: 'page', name: 'Article 6. Commercial Zoning Districts (CG, CR)', url: '/articles/part-iv-employment-zoning-districts/article-6-commercial-zoning-districts-cg-cr' },
            { type: 'page', name: 'Article 7. Campus Zoning Districts (IC-1, IC-2, OFC, OG, RC)', url: '/articles/part-iv-employment-zoning-districts/article-7-campus-zoning-districts-ic-1-ic-2-ofc-og-rc' },
            { type: 'page', name: 'Article 8. Manufacturing & Logistics Zoning Districts', url: '/articles/part-iv-employment-zoning-districts/article-8-manufacturing-logistics-zoning-districts' },
            { type: 'page', name: 'Article 9. Innovation Mixed-Use Zoning District (IMU)', url: '/articles/part-iv-employment-zoning-districts/article-9-innovation-mixed-use-zoning-district-imu' }
          ]
        },
        {
          type: 'folder',
          name: 'Part V: Centers Zoning Districts',
          children: [
            { type: 'page', name: 'Article 10. Neighborhood Commercial Zoning Districts', url: '/articles/part-v-centers-zoning-districts/article-10-neighborhood-commercial-zoning-districts' },
            { type: 'page', name: 'Article 11. Community Activity Center Zoning Districts', url: '/articles/part-v-centers-zoning-districts/article-11-community-activity-center-zoning-districts' },
            { type: 'page', name: 'Article 12. Regional Activity Center Zoning Districts', url: '/articles/part-v-centers-zoning-districts/article-12-regional-activity-center-zoning-districts' },
            { type: 'page', name: 'Article 13. Transit Oriented Development Zoning Districts', url: '/articles/part-v-centers-zoning-districts/article-13-transit-oriented-development-zoning-districts' }
          ]
        },
        {
          type: 'folder',
          name: 'Part VI: Special Purpose & Overlay Zoning Districts',
          children: [
            { type: 'page', name: 'Article 14. Special Purpose & Overlay Zoning Districts', url: '/articles/part-vi-special-purpose-overlay-zoning-districts/article-14-special-purpose-overlay-zoning-districts' }
          ]
        },
        {
          type: 'folder',
          name: 'Part VII: Uses',
          children: [
            { type: 'page', name: 'Article 15. Uses', url: '/articles/part-vii-uses/article-15-uses' }
          ]
        },
        {
          type: 'folder',
          name: 'Part VIII: General Development & Zoning Standards',
          children: [
            { type: 'page', name: 'Article 16. General Development Regulations', url: '/articles/part-viii-general-development-zoning-standards/article-16-general-development-regulations' },
            { type: 'page', name: 'Article 17. Accessory Structures', url: '/articles/part-viii-general-development-zoning-standards/article-17-accessory-structures' },
            { type: 'page', name: 'Article 18. Architectural Features', url: '/articles/part-viii-general-development-zoning-standards/article-18-architectural-features' },
            { type: 'page', name: 'Article 19. Off-Street Vehicle & Bicycle Parking', url: '/articles/part-viii-general-development-zoning-standards/article-19-off-street-vehicle-bicycle-parking' },
            { type: 'page', name: 'Article 20. Landscape, Screening, & Tree Preservation', url: '/articles/part-viii-general-development-zoning-standards/article-20-landscape-screening-tree-preservation' },
            { type: 'page', name: 'Article 21. Loading Spaces, Solid Waste, and Recycling Service Areas', url: '/articles/part-viii-general-development-zoning-standards/article-21-loading-spaces-solid-waste-and-recycling-service-areas' },
            { type: 'page', name: 'Article 22. Signs', url: '/articles/part-viii-general-development-zoning-standards/article-22-signs' }
          ]
        },
        {
          type: 'folder',
          name: 'Part IX: Stormwater',
          children: [
            { type: 'page', name: 'Article 23. Water Supply Watershed Protection', url: '/articles/part-ix-stormwater/article-23-water-supply-watershed-protection' },
            { type: 'page', name: 'Article 24. Drainage', url: '/articles/part-ix-stormwater/article-24-drainage' },
            { type: 'page', name: 'Article 25. Post-Construction Stormwater Regulations', url: '/articles/part-ix-stormwater/article-25-post-construction-stormwater-regulations' },
            { type: 'page', name: 'Article 26. Surface Water Improvement Management (SWIM) Buffers', url: '/articles/part-ix-stormwater/article-26-surface-water-improvement-management-swim-buffers' },
            { type: 'page', name: 'Article 27. Floodplain Regulations', url: '/articles/part-ix-stormwater/article-27-floodplain-regulations' },
            { type: 'page', name: 'Article 28. Soil Erosion & Sedimentation Control', url: '/articles/part-ix-stormwater/article-28-soil-erosion-sedimentation-control' }
          ]
        },
        {
          type: 'folder',
          name: 'Part X: Subdivision, Streets, & Other Infrastructure',
          children: [
            { type: 'page', name: 'Article 29. Introduction to Subdivision, Streets, & Other Infrastructure', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-29-introduction-to-subdivision-streets-other-infrastructure' },
            { type: 'page', name: 'Article 30. Subdivision', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-30-subdivision' },
            { type: 'page', name: 'Article 31. Network Cross Access Driveway Regulations', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-31-network-cross-access-driveway-regulations' },
            { type: 'page', name: 'Article 32. Required New Streets & Transportation Improvements', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-32-required-new-streets-transportation-improvements' },
            { type: 'page', name: 'Article 33. Standards for Streets, Off-Street Public Paths, & Cross Access', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-33-standards-for-streets-off-street-public-paths-cross-access' },
            { type: 'page', name: 'Article 34. Other Infrastructure', url: '/articles/part-x-subdivision-streets-other-infrastructure/article-34-other-infrastructure' }
          ]
        },
        {
          type: 'folder',
          name: 'Part XI: Administration',
          children: [
            { type: 'page', name: 'Article 35. Ordinance Bodies & Administrators', url: '/articles/part-xi-administration/article-35-ordinance-bodies-administrators' },
            { type: 'page', name: 'Article 36. General Processes', url: '/articles/part-xi-administration/article-36-general-processes' },
            { type: 'page', name: 'Article 37. Amendments & Development Approvals', url: '/articles/part-xi-administration/article-37-amendments-development-approvals' }
          ]
        },
        {
          type: 'folder',
          name: 'Part XII: Nonconformities',
          children: [
            { type: 'page', name: 'Article 38. Nonconformities', url: '/articles/part-xii-nonconformities/article-38-nonconformities' }
          ]
        }
      ]
    };
  },

  // Add method to get categories with articles
  async getCategoriesWithArticles() {
    return await getCategoriesWithArticles();
  },

  // Add method to get all articles
  async getArticles() {
    return await getArticles();
  },

  // Add method to get all categories
  async getCategories() {
    return await getCategories();
  }
};

// Start initialization immediately when module loads
initializePageTree();