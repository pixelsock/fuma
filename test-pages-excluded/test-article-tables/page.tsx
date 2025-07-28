import { unifiedSource } from '@/lib/unified-source';
import { UDOContentRenderer } from '@/components/udo-content-renderer';

export default async function TestArticleTablesPage() {
  // Try to get an article that has tables
  const articles = await unifiedSource.getPages();
  
  // Find articles that likely have tables
  const articlesWithTables = articles.filter(article => 
    article.data.content?.includes('<table')
  );

  if (articlesWithTables.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">No Articles with Tables Found</h1>
        <p>No articles containing tables were found in the database.</p>
      </div>
    );
  }

  // Take the first article with tables
  const testArticle = articlesWithTables[0];
  
  // Count tables in the content
  const tableCount = (testArticle.data.content?.match(/<table/g) || []).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Test Article Tables</h1>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Article:</strong> {testArticle.data.title}</p>
        <p><strong>Tables found in HTML:</strong> {tableCount}</p>
        <p><strong>Article slug:</strong> {testArticle.slugs.join('/')}</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Rendered Content:</h2>
        <UDOContentRenderer htmlContent={testArticle.data.content || ''} />
      </div>
    </div>
  );
}