import { GetStaticPaths, GetStaticProps } from 'next';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsPage as DocsPageComponent,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { getMDXComponents } from '@/mdx-components';
import { baseOptions } from '@/app/layout.config';
import { source as originalSource } from '@/lib/source';
import { getArticles, getArticleBySlug, ProcessedArticle } from '@/lib/directus-source';

export interface DocsPageProps {
  article: ProcessedArticle;
  html: MDXRemoteSerializeResult;
  toc: any[];
  source: 'fumadocs' | 'directus';
}

export default function DocsPage({ article, html, toc, source }: DocsPageProps) {
  // Use the fallback logic for title
  const title = article.name ?? article.title ?? 'Untitled';
  
  return (
    <DocsLayout tree={originalSource.pageTree as any} {...baseOptions}>
      <DocsPageComponent toc={toc} full={false}>
        <DocsTitle>{title}</DocsTitle>
        {article.description && (
          <DocsDescription>{article.description}</DocsDescription>
        )}
        <DocsBody>
          <MDXRemote {...html} components={getMDXComponents({})} />
          
          {/* Optional: Show source indicator for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-600">
              Content source: {source}
              {source === 'directus' && article && (
                <details className="mt-2">
                  <summary>Raw Markdown</summary>
                  <pre className="mt-2 text-xs overflow-auto">
                    {article.htmlContent}
                  </pre>
                </details>
              )}
            </div>
          )}
        </DocsBody>
      </DocsPageComponent>
    </DocsLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get all published articles from Directus
    const articles = await getArticles();
    
    // Generate paths from article slugs
    const paths = articles.map(article => ({
      params: {
        slug: article.slug
      }
    }));

    return {
      paths,
      fallback: 'blocking' // Enable ISR with blocking fallback
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<DocsPageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string;
    
    if (!slug) {
      return {
        notFound: true
      };
    }

    // Fetch the article from Directus
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return {
        notFound: true
      };
    }

    // Serialize the MDX content for client-side rendering
    const html = await serialize(article.htmlContent, {
      parseFrontmatter: true
    });

    // Generate table of contents from the MDX content
    // This is a simplified TOC generator - you might want to enhance this
    const toc = generateTOCFromMDX(article.htmlContent);

    return {
      props: {
        article,
        html,
        toc,
        source: 'directus'
      },
      // Enable ISR - revalidate every hour
      revalidate: 3600
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
    return {
      notFound: true
    };
  }
};

// Simple TOC generator function
function generateTOCFromMDX(mdxContent: string): any[] {
  const toc: any[] = [];
  const lines = mdxContent.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      
      toc.push({
        title: text,
        url: `#${id}`,
        depth: level
      });
    }
  }
  
  return toc;
}
