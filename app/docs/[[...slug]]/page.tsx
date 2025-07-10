import { source, unifiedSource } from '@/lib/unified-source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  // First try FumaDocs MDX files
  const mdxPage = source.getPage(params.slug);
  
  if (mdxPage) {
    const MDXContent = mdxPage.data.body;
    
    return (
      <DocsPage toc={mdxPage.data.toc} full={mdxPage.data.full}>
        <DocsTitle>{mdxPage.data.title}</DocsTitle>
        <DocsDescription>{mdxPage.data.description}</DocsDescription>
        <DocsBody>
          <MDXContent components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  }
  
  // If not found, try Directus (async)
  const directusPage = await unifiedSource.getPage(params.slug || []);
  
  if (!directusPage) notFound();

  const MDXContent = directusPage.data.body;
  
  // Debug: Log TOC data
  console.log('Page slug:', params.slug?.join('/') || 'home');
  console.log('Page has TOC:', !!directusPage.data.toc);
  console.log('TOC length:', directusPage.data.toc?.length || 0);
  console.log('TOC data:', JSON.stringify(directusPage.data.toc, null, 2));

  return (
    <DocsPage toc={directusPage.data.toc} full={directusPage.data.full}>
      <DocsTitle>{directusPage.data.title}</DocsTitle>
      <DocsDescription>{directusPage.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return await unifiedSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  // First try FumaDocs MDX files
  const mdxPage = source.getPage(params.slug);
  
  if (mdxPage) {
    return {
      title: mdxPage.data.title,
      description: mdxPage.data.description,
    };
  }
  
  // If not found, try Directus (async)
  const directusPage = await unifiedSource.getPage(params.slug || []);
  
  if (!directusPage) notFound();

  return {
    title: directusPage.data.title,
    description: directusPage.data.description,
  };
}
