import { unifiedSource } from '@/lib/unified-source';

export default async function DebugArticleContentPage() {
  // Get the first article with tables
  const pages = await unifiedSource.getPages();
  
  // Find an article that contains tables
  const articlesWithTables = [];
  
  for (const page of pages) {
    if (page.data.content && page.data.content.includes('<table')) {
      articlesWithTables.push({
        title: page.data.title,
        slug: page.slugs.join('/'),
        tableCount: (page.data.content.match(/<table/g) || []).length,
        contentLength: page.data.content.length,
        sampleContent: page.data.content.substring(
          Math.max(0, page.data.content.indexOf('<table') - 100),
          Math.min(page.data.content.length, page.data.content.indexOf('<table') + 500)
        )
      });
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Article Content</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total pages: {pages.length}</p>
        <p>Pages with tables: {articlesWithTables.length}</p>
      </div>
      
      <div className="space-y-8">
        {articlesWithTables.map((article, index) => (
          <div key={index} className="border p-4 rounded">
            <h3 className="font-semibold text-lg">{article.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Slug: {article.slug} | Tables: {article.tableCount} | Content Length: {article.contentLength}
            </p>
            <div className="bg-gray-100 p-4 rounded mt-2">
              <h4 className="font-semibold mb-2">Table Sample:</h4>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {article.sampleContent}
              </pre>
            </div>
            <a 
              href={`/articles/${article.slug}`} 
              className="inline-block mt-2 text-blue-600 hover:underline"
              target="_blank"
            >
              View Article →
            </a>
          </div>
        ))}
      </div>
      
      {articlesWithTables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No articles with tables found.
        </div>
      )}
    </div>
  );
}