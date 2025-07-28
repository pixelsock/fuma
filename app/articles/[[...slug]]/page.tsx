import { unifiedSource } from '@/lib/unified-source';
import { notFound, redirect } from 'next/navigation';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { UDOContentRendererV3Optimized } from '@/components/udo-content-renderer-v3-optimized';
import { ArticleTitleHeader } from '@/components/article-title-header';
import { DebugTOCData } from '@/components/debug-toc-data';
import { TOCActiveFix } from '@/components/toc-active-fix';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  // Redirect to articles listing page if no slug
  if (!params.slug || params.slug.length === 0) {
    redirect('/articles-listing');
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
        <TOCActiveFix />
        <DebugTOCData toc={directusPage.data.toc || []} />
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
      title: 'Articles - Charlotte UDO',
      description: 'Browse all articles of the Charlotte Unified Development Ordinance',
    };
  }

  // Handle individual article metadata
  const page = await unifiedSource.getPage(params.slug);
  
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}