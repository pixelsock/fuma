# ProseMirror ➜ MDX/HTML Integration for FumaDocs

This implementation converts ProseMirror content from Directus to Markdown/MDX format that works seamlessly with FumaDocs.

## 🎯 Approach

Instead of converting **ProseMirror → HTML → MDX**, we use a much cleaner approach:

**ProseMirror → Markdown → MDX/FumaDocs**

This leverages the `tiptap-markdown` extension to convert ProseMirror content directly to clean Markdown, which integrates perfectly with FumaDocs.

## 📁 Files Added/Modified

### Core Files Added

1. **`utils/prosemirror.ts`** - ProseMirror to Markdown conversion utilities
2. **`lib/directus-source.ts`** - Directus content fetching with authentication
3. **`lib/unified-source.ts`** - Unified source combining FumaDocs MDX + Directus content

### Modified Files

1. **`app/docs/[[...slug]]/page.tsx`** - Updated to use unified source
2. **`app/api/search/route.ts`** - Updated search to include Directus content
3. **`app/docs/layout.tsx`** - Updated imports for navigation

## 🚀 Key Features

### ✅ ProseMirror to Markdown Conversion

- Uses `tiptap-markdown` extension for high-quality conversion
- Preserves formatting: **bold**, *italic*, lists, headings, etc.
- Handles complex structures: tables, blockquotes, code blocks
- Server-side rendering compatible

### ✅ Directus Integration

- Email/password authentication
- Fetches published articles only
- Processes ProseMirror content to clean Markdown
- Generates MDX with frontmatter for FumaDocs

### ✅ Unified Content Source

- Seamlessly combines FumaDocs MDX files with Directus content
- Fallback system: tries FumaDocs first, then Directus
- Unified search across both content sources
- Static generation support

### ✅ FumaDocs Compatibility

- Generates proper MDX with frontmatter
- Works with existing FumaDocs layout and navigation
- Supports all FumaDocs features (TOC, full-width, etc.)
- Maintains styling and components

## ⚙️ Configuration

### Environment Variables

Add to `.env.local`:

```env
# Directus Configuration
DIRECTUS_URL=http://localhost:8055
DIRECTUS_EMAIL=admin@example.com
DIRECTUS_PASSWORD=your_password
```

### Directus Schema Requirements

Your Directus `articles` collection should have:

```typescript
interface Article {
  id: string;
  title: string;
  description?: string;
  content: any; // ProseMirror JSON
  slug: string;
  status: 'published' | 'draft';
  date_created: string;
  date_updated: string;
}
```

## 🔧 Usage

### 1. Basic ProseMirror to Markdown

```typescript
import { proseMirrorToMarkdown } from '@/utils/prosemirror';

const proseMirrorContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello World' }]
    }
  ]
};

const markdown = proseMirrorToMarkdown(proseMirrorContent);
// Result: "# Hello World"
```

### 2. With MDX Frontmatter

```typescript
import { proseMirrorToMarkdown, markdownToMdx } from '@/utils/prosemirror';

const markdown = proseMirrorToMarkdown(content);
const mdx = markdownToMdx(markdown, {
  addFrontmatter: {
    title: 'Article Title',
    description: 'Article description',
    date: '2024-01-01'
  }
});
```

### 3. Fetch from Directus

```typescript
import { getArticleBySlug, getArticles } from '@/lib/directus-source';

// Get single article
const article = await getArticleBySlug('my-article');

// Get all articles
const articles = await getArticles();
```

## 🔍 How It Works

### Content Flow

1. **Directus**: Stores articles with ProseMirror JSON content
2. **Conversion**: `proseMirrorToMarkdown()` converts to clean Markdown
3. **Enhancement**: `markdownToMdx()` adds frontmatter and MDX features
4. **Compilation**: `next-mdx-remote` compiles MDX to React components
5. **Rendering**: FumaDocs renders the content with full styling

### Source Resolution

```typescript
// app/docs/[[...slug]]/page.tsx
const page = await unifiedSource.getPage(params.slug);

// 1. Check FumaDocs MDX files first
// 2. If not found, check Directus articles
// 3. Return unified page data structure
```

### Search Integration

```typescript
// app/api/search/route.ts
const pages = await unifiedSource.getAllPages();
// Includes both FumaDocs and Directus content in search
```

## 🧪 Testing

Run the development server:

```bash
npm run dev
```

Visit:
- `/docs` - FumaDocs content (from MDX files)
- `/docs/your-directus-slug` - Directus content (converted from ProseMirror)

## 🎨 Benefits

### vs. HTML Conversion
- ✅ **Cleaner**: Native Markdown is more maintainable
- ✅ **Better SEO**: Semantic markup instead of HTML soup  
- ✅ **FumaDocs Native**: Works perfectly with MDX ecosystem
- ✅ **Extensible**: Easy to add custom MDX components

### vs. Direct ProseMirror Rendering
- ✅ **Static Generation**: Pre-renders at build time
- ✅ **Performance**: No client-side ProseMirror parsing
- ✅ **Consistency**: Same styling as regular docs
- ✅ **Search**: Full-text search across all content

## 🐛 Debugging

### Development Mode

When `NODE_ENV=development`, the page shows:
- Content source (FumaDocs vs Directus)
- Raw Markdown output for inspection

### Common Issues

1. **Build Errors**: Check Directus connection in environment variables
2. **Missing Content**: Verify article `status = 'published'`
3. **Conversion Issues**: Check ProseMirror JSON structure
4. **Authentication**: Ensure Directus credentials are correct

## 📦 Dependencies Added

```json
{
  "tiptap-markdown": "^0.8.10",
  "@tiptap/core": "^2.23.0", 
  "@tiptap/starter-kit": "^2.23.0",
  "next-mdx-remote": "^5.0.0"
}
```

## 🎯 Next Steps

1. **Custom MDX Components**: Add Directus-specific components
2. **Image Handling**: Process Directus images for FumaDocs
3. **Caching**: Add Redis/memory cache for Directus content
4. **Navigation**: Include Directus content in sidebar navigation
5. **Validation**: Add content validation before conversion

---

This integration provides a robust, maintainable solution for converting ProseMirror content to work seamlessly with FumaDocs while maintaining excellent performance and developer experience.
