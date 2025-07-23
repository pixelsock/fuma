import { unifiedSource } from '@/lib/unified-source';
import { notFound } from 'next/navigation';
import { DocsPage, DocsTitle, DocsDescription, DocsBody } from 'fumadocs-ui/page';
import { UDOContentRendererV3Optimized } from '@/components/udo-content-renderer-v3-optimized';
import { ArticleTitleHeader } from '@/components/article-title-header';
import { UncategorizedArticles } from '@/components/uncategorized-articles';
import { EnhancedCategoryOverview } from '@/components/enhanced-category-overview';
import { EnhancedArticleGrid } from '@/components/enhanced-article-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Grid3X3, List } from 'lucide-react';
import Link from 'next/link';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  if (!params.slug || params.slug.length === 0) {
    const categories = await unifiedSource.getCategoriesWithArticles();
    const totalArticles = categories.reduce((sum, cat) => sum + cat.articles.length, 0);

    return (
      <DocsPage>
        <DocsBody className="max-w-none">
          {/* Quick Search Section */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/50 rounded-2xl p-8 mb-12">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Search Charlotte UDO Articles</h2>
                <p className="text-muted-foreground">
                  Find specific regulations, guidelines, and information quickly
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search articles, regulations, zoning..."
                    className="pl-10 text-center"
                    onFocus={(e) => {
                      // Redirect to enhanced search page when focused
                      window.location.href = '/articles-enhanced';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="default">
                  <Link href="/articles-enhanced?view=grid">
                    <Grid3X3 className="mr-2 w-4 h-4" />
                    Grid View
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/articles-enhanced?view=list">
                    <List className="mr-2 w-4 h-4" />
                    Table View
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <EnhancedCategoryOverview 
            categories={categories.filter(cat => cat.slug !== 'uncategorized')}
            title="Browse by Category"
            description={`Explore ${totalArticles} articles organized into ${categories.filter(cat => cat.slug !== 'uncategorized').length} categories`}
          />
          
          {/* Display uncategorized articles separately if they exist */}
          {(() => {
            const uncategorized = categories.find(cat => cat.slug === 'uncategorized');
            return uncategorized && uncategorized.articles.length > 0 ? (
              <div className="mt-16">
                <UncategorizedArticles articles={uncategorized.articles} />
              </div>
            ) : null;
          })()}
        </DocsBody>
      </DocsPage>
    );
  }

  // Check if this is a category page (single slug element)
  if (params.slug.length === 1) {
    const categorySlug = params.slug[0];
    const categories = await unifiedSource.getCategoriesWithArticles();
    const category = categories.find(cat => cat.slug === categorySlug);
    
    if (category) {
      // Transform articles to match the enhanced component interface
      const enhancedArticles = category.articles.map(article => ({
        name: article.name,
        slug: article.slug,
        url: article.url,
        description: undefined, // Could be enhanced with actual descriptions
        category: {
          name: category.name,
          slug: category.slug
        },
        date: undefined, // Could be enhanced with actual dates
        readTime: undefined, // Could be calculated
        tags: undefined, // Could be enhanced with actual tags
        author: undefined, // Could be enhanced with actual authors
        isNew: false, // Could be enhanced with actual logic
        isPdf: false // Could be enhanced with actual PDF detection
      }));

      // Create categories data for filtering
      const categoryData = [{
        name: category.name,
        slug: category.slug,
        count: category.articles.length
      }];

      return (
        <DocsPage>
          <DocsBody className="max-w-none">
            <EnhancedArticleGrid
              articles={enhancedArticles}
              categories={categoryData}
              title={category.name}
              description={category.description || `Browse all ${category.articles.length} articles in ${category.name}`}
              showSearch={true}
              showFilters={false} // Hide category filter since we're already in a category
              defaultView="grid"
            />
          </DocsBody>
        </DocsPage>
      );
    }
  }

  // Handle individual article pages
  const directusPage = await unifiedSource.getPage(params.slug);
  
  if (!directusPage) notFound();

  // Extract the slug for the component
  const articleSlug = params.slug.join('/');
  
  // Check if there are any headings in the TOC
  const hasToc = directusPage.data.toc && directusPage.data.toc.length > 0;
  
  // Use Fumadocs built-in TOC with clerk style
  return (
    <DocsPage 
      toc={directusPage.data.toc || []}
      tableOfContent={{
        style: 'clerk',
        enabled: hasToc,
        single: false,
      }}
      tableOfContentPopover={{
        style: 'clerk',
        enabled: hasToc
      }}
    >
      <DocsBody>
        <ArticleTitleHeader 
          category={directusPage.data.category?.name}
          title={directusPage.data.title}
          slug={articleSlug}
          description={directusPage.data.description}
          pdfUrl={directusPage.data.pdf}
        />
        <UDOContentRendererV3Optimized htmlContent={directusPage.data.content || ''} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  // Handle index page metadata
  if (!params.slug || params.slug.length === 0) {
    return {
      title: 'Charlotte UDO Articles',
      description: 'Browse all articles of the Charlotte Unified Development Ordinance organized by category',
    };
  }

  // Check if this is a category page
  if (params.slug.length === 1) {
    const categorySlug = params.slug[0];
    const categories = await unifiedSource.getCategoriesWithArticles();
    const category = categories.find(cat => cat.slug === categorySlug);
    
    if (category) {
      return {
        title: `${category.name} - Charlotte UDO`,
        description: category.description || `Browse all ${category.articles.length} articles in the ${category.name} category`,
      };
    }
  }

  // Handle individual article metadata
  const page = await unifiedSource.getPage(params.slug);
  
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}