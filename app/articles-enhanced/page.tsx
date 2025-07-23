import { Suspense } from 'react'
import { unifiedSource } from '@/lib/unified-source'
import { DocsPage, DocsBody } from 'fumadocs-ui/page'
import { EnhancedArticleGrid } from '@/components/enhanced-article-grid'
import { Skeleton } from '@/components/ui/skeleton'

interface SearchParams {
  view?: 'grid' | 'list'
  category?: string
  search?: string
}

async function ArticlesContent({ searchParams }: { searchParams: SearchParams }) {
  const categories = await unifiedSource.getCategoriesWithArticles()
  
  // Flatten all articles from all categories
  const allArticles = categories.flatMap(category => 
    category.articles.map(article => ({
      name: article.name,
      slug: article.slug,
      url: article.url,
      description: undefined, // Could be enhanced with actual descriptions
      category: {
        name: category.name,
        slug: category.slug
      },
      date: undefined, // Could be enhanced with actual dates
      readTime: undefined, // Could be calculated from content
      tags: undefined, // Could be enhanced with actual tags
      author: undefined, // Could be enhanced with actual authors
      isNew: false, // Could be enhanced with actual logic
      isPdf: false // Could be enhanced with actual PDF detection
    }))
  ).filter(article => article.category.slug !== 'uncategorized')

  // Create categories data for filtering
  const categoryData = categories
    .filter(cat => cat.slug !== 'uncategorized' && cat.articles.length > 0)
    .map(cat => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.articles.length
    }))

  const totalArticles = allArticles.length

  return (
    <EnhancedArticleGrid
      articles={allArticles}
      categories={categoryData}
      title="All UDO Articles"
      description={`Search and browse all ${totalArticles} articles of the Charlotte Unified Development Ordinance`}
      showSearch={true}
      showFilters={true}
      defaultView={searchParams.view || 'grid'}
    />
  )
}

function ArticlesLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-6 w-96" />
      </div>
      
      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ArticlesEnhancedPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams

  return (
    <DocsPage>
      <DocsBody className="max-w-none">
        <Suspense fallback={<ArticlesLoadingSkeleton />}>
          <ArticlesContent searchParams={searchParams} />
        </Suspense>
      </DocsBody>
    </DocsPage>
  )
} 