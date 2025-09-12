'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Search, 
  Grid3X3, 
  List,
  FileText,
  ExternalLink,
} from 'lucide-react';
import ArticlesTable from '@/components/articles-table';

interface Article {
  id: string;
  name: string;
  slug: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  pdf?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface ArticlesGridProps {
  articles: Article[];
  categories: Category[];
}

type ViewMode = 'grid' | 'list';

export default function ArticlesGrid({ articles, categories }: ArticlesGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Extract article number from slug
  const getArticleNumber = (slug: string): number => {
    const match = slug.match(/article-(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  // Generate the full article URL
  const getArticleUrl = (article: Article): string => {
    const articleNumber = getArticleNumber(article.slug);
    
    // Map article numbers to their sections
    let section = '';
    if (articleNumber >= 1 && articleNumber <= 2) {
      section = 'part-i-ordinance-introduction';
    } else if (articleNumber === 3) {
      section = 'part-ii-zoning-introduction';
    } else if (articleNumber >= 4 && articleNumber <= 5) {
      section = 'part-iii-neighborhood-zoning-districts';
    } else if (articleNumber >= 6 && articleNumber <= 9) {
      section = 'part-iv-employment-zoning-districts';
    } else if (articleNumber >= 10 && articleNumber <= 13) {
      section = 'part-v-centers-zoning-districts';
    } else if (articleNumber === 14) {
      section = 'part-vi-special-purpose-overlay-zoning-districts';
    } else if (articleNumber === 15) {
      section = 'part-vii-uses';
    } else if (articleNumber >= 16 && articleNumber <= 22) {
      section = 'part-viii-general-development-zoning-standards';
    } else if (articleNumber >= 23 && articleNumber <= 28) {
      section = 'part-ix-stormwater';
    } else if (articleNumber >= 29 && articleNumber <= 34) {
      section = 'part-x-subdivision-streets-other-infrastructure';
    } else if (articleNumber >= 35 && articleNumber <= 37) {
      section = 'part-xi-administration';
    } else if (articleNumber === 38) {
      section = 'part-xii-nonconformities';
    } else if (articleNumber === 39) {
      section = 'part-xiii-enforcement';
    }

    return section ? `/articles/${section}/${article.slug}` : `/articles/${article.slug}`;
  };

  // Filter articles based on search
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const searchLower = searchTerm.toLowerCase();
      return (
        article.name.toLowerCase().includes(searchLower) ||
        article.slug.toLowerCase().includes(searchLower) ||
        article.category?.name.toLowerCase().includes(searchLower) ||
        ''
      );
    });
  }, [articles, searchTerm]);

  // Group articles by category
  const groupedArticles = useMemo(() => {
    const grouped = new Map<string, { category: Category | null; articles: Article[] }>();
    
    filteredArticles.forEach(article => {
      const categoryId = article.category?.id || 'uncategorized';
      const categoryName = article.category?.name || 'Uncategorized';
      const categoryData = article.category || null;

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          category: categoryData,
          articles: []
        });
      }

      grouped.get(categoryId)!.articles.push(article);
    });

    // Sort articles within each category by article number
    grouped.forEach(group => {
      group.articles.sort((a, b) => getArticleNumber(a.slug) - getArticleNumber(b.slug));
    });

    // Convert to array and sort categories
    return Array.from(grouped.entries()).map(([id, data]) => ({
      id,
      ...data
    })).sort((a, b) => {
      // Put "Uncategorized" last
      if (a.id === 'uncategorized') return 1;
      if (b.id === 'uncategorized') return -1;
      
      // Sort by category name
      const nameA = a.category?.name || 'Uncategorized';
      const nameB = b.category?.name || 'Uncategorized';
      return nameA.localeCompare(nameB);
    });
  }, [filteredArticles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charlotte UDO Articles</h1>
        <p className="text-muted-foreground mt-2">
          Browse and search through all {articles.length} articles of the Charlotte Unified Development Ordinance
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)} variant="outline">
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groupedArticles.map(({ id, category, articles: categoryArticles }) => (
            <Card key={id} className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category?.color || '#6B7280' }}
                  />
                  <CardTitle className="text-lg">
                    {category?.name || 'Uncategorized'}
                  </CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {categoryArticles.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {categoryArticles.map((article) => (
                  <div key={article.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={getArticleUrl(article)}
                        className="hover:text-primary transition-colors"
                      >
                        <p className="text-sm font-medium leading-none break-words">
                          {article.name}
                        </p>
                      </Link>
                    </div>
                    {article.pdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        asChild
                      >
                        <a
                          href={`https://admin.charlotteudo.org/assets/${article.pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View PDF"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ArticlesTable articles={filteredArticles} categories={categories} />
      )}

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredArticles.length} of {articles.length} articles
        {searchTerm && (
          <span> matching "{searchTerm}"</span>
        )}
        {viewMode === 'grid' && (
          <span> grouped by {groupedArticles.length} categories</span>
        )}
      </div>
    </div>
  );
}