'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText, 
  ArrowRight, 
  Calendar, 
  Clock, 
  User, 
  Tag,
  Eye,
  BookOpen,
  ChevronRight,
  Download,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Article {
  name: string
  slug: string
  url: string
  description?: string
  category?: {
    name: string
    slug: string
  }
  date?: string
  readTime?: string
  tags?: string[]
  author?: string
  isNew?: boolean
  isPdf?: boolean
}

interface EnhancedArticleGridProps {
  articles: Article[]
  categories?: Array<{ name: string; slug: string; count: number }>
  title?: string
  description?: string
  showSearch?: boolean
  showFilters?: boolean
  defaultView?: 'grid' | 'list'
}

const ArticleTableRow = ({ article, index }: { article: Article; index: number }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.02 }}
      className="group hover:bg-muted/50 cursor-pointer"
      onClick={() => window.location.href = article.url}
    >
      <TableCell className="w-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
          {article.isPdf ? (
            <Download className="w-4 h-4 text-primary" />
          ) : (
            <FileText className="w-4 h-4 text-primary" />
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span className="group-hover:text-primary transition-colors">
            {article.name}
          </span>
          {article.isNew && (
            <Badge variant="default" className="text-xs">New</Badge>
          )}
        </div>
        {article.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {article.description}
          </p>
        )}
      </TableCell>
      <TableCell>
        {article.category && (
          <Badge variant="outline" className="text-xs">
            {article.category.name}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {article.date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{article.date}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {article.readTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="w-12">
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </TableCell>
    </motion.tr>
  )
}

const ArticleGridCard = ({ article, index, viewMode }: { article: Article; index: number; viewMode: 'grid' | 'list' }) => {
  // List view is now handled by ArticleTable component, so this only handles grid view

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      <Link href={article.url} className="block h-full">
        <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                {article.isPdf ? (
                  <Download className="w-6 h-6 text-primary" />
                ) : (
                  <FileText className="w-6 h-6 text-primary" />
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                {article.isNew && (
                  <Badge variant="default" className="text-xs w-fit ml-auto">
                    New
                  </Badge>
                )}
                {article.category && (
                  <Badge variant="outline" className="text-xs w-fit ml-auto">
                    {article.category.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {article.name}
            </CardTitle>
            
            {article.description && (
              <CardDescription className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                {article.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Metadata */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {article.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                  </div>
                )}
                {article.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                )}
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{article.author}</span>
                  </div>
                )}
              </div>
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 2).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      +{article.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Action */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center text-primary text-sm font-medium">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Read article
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export function EnhancedArticleGrid({ 
  articles, 
  categories,
  title = "Articles",
  description,
  showSearch = true,
  showFilters = true,
  defaultView = 'grid'
}: EnhancedArticleGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and sort articles
  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        article.category?.slug === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Article] as string || ''
      let bValue = b[sortBy as keyof Article] as string || ''
      
      const comparison = aValue.localeCompare(bValue)
      return sortOrder === 'asc' ? comparison : -comparison
    })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
        
        {/* Controls */}
        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
              {showSearch && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
              
              {showFilters && (
                <div className="flex gap-2">
                  {categories && categories.length > 0 && (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
            
            {/* View Toggle */}
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value: string) => {
                if (value === 'grid' || value === 'list') {
                  setViewMode(value)
                }
              }}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid3X3 className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredArticles.length} of {articles.length} articles
        </span>
        {searchQuery && (
          <span>
            Results for "{searchQuery}"
          </span>
        )}
      </div>

      {/* Articles Grid/List */}
      {filteredArticles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleGridCard
                key={article.slug}
                article={article}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="w-40">Category</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead className="w-32">Read Time</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article, index) => (
                  <ArticleTableRow
                    key={article.slug}
                    article={article}
                    index={index}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No articles found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `No articles match "${searchQuery}". Try adjusting your search.`
              : "No articles available at the moment."
            }
          </p>
          {searchQuery && (
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
} 