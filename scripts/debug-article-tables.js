// Plain Node.js script to inspect table HTML from Directus
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.DIRECTUS_URL || process.env.PRODUCTION_DIRECTUS_URL || process.env.LOCAL_DIRECTUS_URL || 'https://admin.charlotteudo.org';
  const token = process.env.DIRECTUS_TOKEN || process.env.PRODUCTION_DIRECTUS_TOKEN || process.env.LOCAL_DIRECTUS_TOKEN;
  if (!token) {
    console.error('Missing Directus token in environment (.env.local)');
    process.exit(1);
  }
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchArticleBySimpleSlug(simple) {
    const u = `${url}/items/articles?filter[slug][_eq]=${encodeURIComponent(simple)}&fields=id,name,slug,status,content&limit=1`;
    const r = await fetch(u, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    return j.data && j.data[0];
  }

  function analyze(article) {
    if (!article) return { found: false };
    const c = article.content || '';
    const matches = c.match(/<table[\s>][\s\S]*?<\/table>/gi) || [];
    const first = matches[0];
    const preview = first ? first.slice(0, 800) : undefined;
    return {
      found: true,
      id: article.id,
      name: article.name,
      slug: article.slug,
      status: article.status,
      contentLength: c.length,
      tableCount: matches.length,
      firstTable: preview,
    };
  }

  // 1) Article 6
  const article6 = 'article-6-commercial-zoning-districts-cg-cr';
  const a6 = await fetchArticleBySimpleSlug(article6);
  console.log('--- Article 6 (raw) ---');
  console.log(JSON.stringify(analyze(a6), null, 2));

  // 2) Auto-detect a published article containing a table
  const u2 = `${url}/items/articles?filter[content][_contains]=${encodeURIComponent('<table')}&filter[status][_in]=publish,published&fields=id,name,slug,status,content&limit=1`;
  const r2 = await fetch(u2, { headers });
  if (r2.ok) {
    const j2 = await r2.json();
    const aAny = j2.data && j2.data[0];
    console.log('\n--- Another article with a table (raw) ---');
    console.log(JSON.stringify(analyze(aAny), null, 2));
  } else {
    console.log('Could not auto-detect article with table');
  }
}

main().catch(e => { console.error(e); process.exit(1); });

