'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileText,
  ExternalLink,
  Filter,
  X
} from 'lucide-react';

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

interface ArticlesTableProps {
  articles: Article[];
  categories: Category[];
}

type SortKey = 'name' | 'category';
type SortDirection = 'asc' | 'desc';

export default function ArticlesTable({ articles, categories }: ArticlesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  // Handle sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories([]);
    } else if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Handle category removal
  const handleCategoryRemove = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
  };

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        article.name.toLowerCase().includes(searchLower) ||
        article.slug.toLowerCase().includes(searchLower) ||
        article.category?.name.toLowerCase().includes(searchLower) ||
        ''
      );
      
      const matchesCategory = selectedCategories.length === 0 || 
        (selectedCategories.includes('uncategorized') && !article.category) ||
        (article.category && selectedCategories.includes(article.category.id));
      
      return matchesSearch && matchesCategory;
    });

    // Sort articles by article number first, then by selected column
    filtered.sort((a, b) => {
      // First sort by article number
      const articleComparison = getArticleNumber(a.slug) - getArticleNumber(b.slug);
      
      // If sorting by name and article numbers are equal, use name
      if (sortKey === 'name' && articleComparison === 0) {
        const comparison = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // If sorting by category, sort by category first, then article number
      if (sortKey === 'category') {
        const catA = a.category?.name || 'Uncategorized';
        const catB = b.category?.name || 'Uncategorized';
        const categoryComparison = catA.localeCompare(catB);
        
        if (categoryComparison !== 0) {
          return sortDirection === 'asc' ? categoryComparison : -categoryComparison;
        }
      }
      
      // Default to article number order
      return articleComparison;
    });

    return filtered;
  }, [articles, searchTerm, sortKey, sortDirection, selectedCategories]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Charlotte UDO Articles</h1>
        <p className="text-muted-foreground mt-2">
          Browse and search through all {articles.length} articles of the Charlotte Unified Development Ordinance
        </p>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card">
        {/* Toolbar */}
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value="" onValueChange={handleCategorySelect}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Add category filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Clear all filters</SelectItem>
                  {categories.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      disabled={selectedCategories.includes(category.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem 
                    value="uncategorized"
                    disabled={selectedCategories.includes('uncategorized')}
                  >
                    Uncategorized
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Category Tags */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(categoryId => {
                  const category = categoryId === 'uncategorized' 
                    ? { id: 'uncategorized', name: 'Uncategorized', color: null }
                    : categories.find(c => c.id === categoryId);
                  
                  if (!category) return null;
                  
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 flex items-center gap-1"
                      style={{
                        backgroundColor: category.color ? `${category.color}20` : undefined,
                        borderColor: category.color || undefined,
                      }}
                    >
                      <span style={{ color: category.color || undefined }}>
                        {category.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleCategoryRemove(categoryId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-2 hover:bg-transparent"
                  onClick={() => handleSort('name')}
                >
                  Title
                  <SortIcon column="name" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[150px] hidden sm:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 -ml-2 hover:bg-transparent"
                  onClick={() => handleSort('category')}
                >
                  Category
                  <SortIcon column="category" />
                </Button>
              </TableHead>
              <TableHead className="w-[60px] text-center">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No articles found matching "{searchTerm}"
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedArticles.map((article) => {
                const articleNumber = getArticleNumber(article.slug);
                const articleUrl = getArticleUrl(article);
                
                return (
                  <TableRow key={article.id}>
                    <TableCell className="whitespace-normal">
                      <Link 
                        href={articleUrl}
                        className="hover:text-primary transition-colors flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="break-words">{article.name}</span>
                        </div>
                        {/* Show category as subtitle on mobile */}
                        {article.category && (
                          <Badge 
                            variant="secondary"
                            className="font-normal text-xs sm:hidden mt-1 w-fit"
                            style={{
                              backgroundColor: article.category.color ? `${article.category.color}20` : undefined,
                              borderColor: article.category.color || undefined,
                              color: article.category.color || undefined
                            }}
                          >
                            {article.category.name}
                          </Badge>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {article.category ? (
                        <Badge 
                          variant="secondary"
                          className="font-normal whitespace-nowrap"
                          style={{
                            backgroundColor: article.category.color ? `${article.category.color}20` : undefined,
                            borderColor: article.category.color || undefined,
                            color: article.category.color || undefined
                          }}
                        >
                          {article.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {article.pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          asChild
                        >
                          <a
                            href={`https://admin.charlotteudo.org/assets/${article.pdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View PDF"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredAndSortedArticles.length} of {articles.length} articles
        {selectedCategories.length > 0 && (
          <span>
            {' '}filtered by {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>
    </div>
  );
}