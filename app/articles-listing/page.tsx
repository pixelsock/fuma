import { unifiedSource } from '@/lib/unified-source';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import ArticlesTable from '@/components/articles-table';

export default async function ArticlesListingPage() {
  const articles = await unifiedSource.getArticles();
  const categories = await unifiedSource.getCategories();
  
  return (
    <DocsPage>
      <DocsBody className="max-w-content mx-auto">
        <ArticlesTable articles={articles} categories={categories} />
      </DocsBody>
    </DocsPage>
  );
}