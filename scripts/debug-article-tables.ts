import { config } from 'dotenv';
import { resolve } from 'path';
import { directus, ensureAuthenticated } from '../lib/directus-client';
import { readItems } from '@directus/sdk';

// Load env from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

type Article = { id: string; name: string; slug: string; status: string; content?: string };

function extractFirstTable(html: string): { hasTable: boolean; tableCount: number; tableHtml?: string; preview?: string } {
  if (!html) return { hasTable: false, tableCount: 0 };
  const lower = html.toLowerCase();
  const matches = html.match(/<table[\s>][\s\S]*?<\/table>/gi);
  const tableCount = matches ? matches.length : 0;
  if (matches && matches.length > 0) {
    return { hasTable: true, tableCount, tableHtml: matches[0] };
  }
  const firstIdx = lower.indexOf('<table');
  const preview = firstIdx >= 0 ? html.slice(firstIdx, firstIdx + 400) : undefined;
  return { hasTable: firstIdx >= 0, tableCount, preview };
}

async function fetchBySlug(slug: string) {
  const authenticated = await ensureAuthenticated();
  if (!authenticated) throw new Error('Not authenticated to Directus');

  const items = await directus.request(
    readItems('articles', {
      filter: { slug: { _eq: slug }, status: { _in: ['publish', 'published', 'draft'] } },
      fields: ['id', 'name', 'slug', 'status', 'content'],
      limit: 1,
    })
  );
  return (items && items[0]) as Article | undefined;
}

async function fetchAnyWithTable() {
  const authenticated = await ensureAuthenticated();
  if (!authenticated) throw new Error('Not authenticated to Directus');

  const items = await directus.request(
    readItems('articles', {
      filter: { content: { _contains: '<table' }, status: { _in: ['publish', 'published'] } },
      fields: ['id', 'name', 'slug', 'status', 'content'],
      limit: 1,
      sort: ['name']
    })
  );
  return (items && items[0]) as Article | undefined;
}

async function main() {
  // Article 6 simple slug
  const article6 = 'article-6-commercial-zoning-districts-cg-cr';
  const a6 = await fetchBySlug(article6);
  console.log('--- Article 6 (raw) ---');
  if (!a6) {
    console.log('Not found');
  } else {
    const analysis = extractFirstTable(a6.content || '');
    console.log(JSON.stringify({
      id: a6.id,
      name: a6.name,
      slug: a6.slug,
      status: a6.status,
      contentLength: (a6.content || '').length,
      tableCount: analysis.tableCount,
    }, null, 2));
    if (analysis.tableHtml) {
      console.log('\nFirst <table> block (truncated to 800 chars):');
      console.log((analysis.tableHtml.length > 800 ? analysis.tableHtml.slice(0, 800) + '…' : analysis.tableHtml));
    } else if (analysis.preview) {
      console.log('\n<table> preview:');
      console.log(analysis.preview);
    } else {
      console.log('\nNo <table> found in content.');
    }
  }

  // Auto-detect another article that contains a table
  const any = await fetchAnyWithTable();
  console.log('\n--- Another article with a table (raw) ---');
  if (!any) {
    console.log('No article with <table> detected');
  } else {
    const analysis = extractFirstTable(any.content || '');
    console.log(JSON.stringify({
      id: any.id,
      name: any.name,
      slug: any.slug,
      status: any.status,
      contentLength: (any.content || '').length,
      tableCount: analysis.tableCount,
    }, null, 2));
    if (analysis.tableHtml) {
      console.log('\nFirst <table> block (truncated to 800 chars):');
      console.log((analysis.tableHtml.length > 800 ? analysis.tableHtml.slice(0, 800) + '…' : analysis.tableHtml));
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

