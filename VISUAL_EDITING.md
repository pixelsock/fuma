# Visual Editing Integration

This project integrates Directus Visual Editing to allow content editors to edit content directly from the frontend.

## Setup

The visual editing library has been installed and configured:

```bash
npm install @directus/visual-editing
```

## How It Works

### 1. Visual Editing Provider

The `VisualEditingProvider` component is added to the root layout (`app/layout.tsx`) and automatically initializes the connection to Directus when the page is loaded in visual editing mode.

### 2. Visual Editing Mode

Visual editing is only enabled when the URL contains the query parameter `?visual-editing=true`. This prevents sensitive data attributes from being exposed in production.

**Example URL for Visual Editor:**
```
http://localhost:3002/?visual-editing=true
```

### 3. Adding Visual Editing to Components

Use the helper functions from `@/lib/visual-editing` to add data-directus attributes to your components:

```tsx
import { getDirectusAttr, getDirectusAttrs } from '@/lib/visual-editing'

// For a single field
<h1 data-directus={getDirectusAttr('home_page', item.id, 'title', 'popover')}>
  {item.title}
</h1>

// For multiple fields
<div data-directus={getDirectusAttrs('articles', article.id, ['title', 'content'], 'drawer')}>
  <h2>{article.title}</h2>
  <div>{article.content}</div>
</div>
```

### 4. Edit Modes

Three edit modes are available:

- **`popover`**: Quick inline editing (best for single fields)
- **`drawer`**: Side panel editor (good for multiple fields)
- **`modal`**: Full modal editor (for complex editing)

## Configuration in Directus

### Visual Editor Module Setup

1. Go to **Settings > Project Settings** in your Directus instance
2. Navigate to the **Visual Editor** section
3. Add your frontend URL with the visual editing parameter:
   - **Development**: `http://localhost:3002/?visual-editing=true`
   - **Production**: `https://your-domain.com/?visual-editing=true`

### Content Security Policy

If you have CSP configured, ensure your site can be embedded in an iframe:

```
frame-ancestors 'self' https://admin.charlotteudo.org https://udo-backend-y1w0.onrender.com;
```

## Usage Examples

### Homepage Example

The homepage (`app/(home)/page.tsx`) demonstrates visual editing:

```tsx
<h1 
  className="..."
  data-directus={getDirectusAttr('home_page', homepageData.id, 'header_text', 'popover')}
>
  {homepageData.header_text}
</h1>
```

### Article Example

For articles, you can add visual editing to titles, content, and metadata:

```tsx
import { getDirectusAttr } from '@/lib/visual-editing'

<article>
  <h1 data-directus={getDirectusAttr('articles', article.id, 'title', 'popover')}>
    {article.title}
  </h1>
  
  <div data-directus={getDirectusAttr('articles', article.id, 'content', 'drawer')}>
    {article.content}
  </div>
</article>
```

## API Reference

### Helper Functions

#### `isVisualEditingMode()`
Returns `true` if the current page is in visual editing mode.

#### `getDirectusAttr(collection, item, field, mode)`
Generates a data-directus attribute for a single field.

**Parameters:**
- `collection`: Collection name (e.g., 'articles', 'home_page')
- `item`: Item ID
- `field`: Field name to edit
- `mode`: Edit mode ('drawer' | 'modal' | 'popover')

#### `getDirectusAttrs(collection, item, fields, mode)`
Generates a data-directus attribute for multiple fields.

**Parameters:**
- `collection`: Collection name
- `item`: Item ID
- `fields`: Array of field names
- `mode`: Edit mode

#### `initVisualEditing(options)`
Manually initialize visual editing (usually not needed as the provider handles this).

#### `removeVisualEditing()`
Remove all visual editing elements (useful for client-side navigation).

## Security Considerations

1. **Query Parameter Protection**: Visual editing attributes are only rendered when `?visual-editing=true` is present in the URL.

2. **Token Security**: The visual editor should include a secure token in the URL to prevent unauthorized access:
   ```
   ?visual-editing=true&token=your-secure-token
   ```

3. **Production Safety**: Always verify that sensitive data attributes are not exposed in production builds.

## Troubleshooting

### Visual editing not working

1. Check that the URL includes `?visual-editing=true`
2. Verify the Directus URL is correct in your environment variables
3. Check browser console for errors
4. Ensure CSP allows iframe embedding

### Changes not saving

1. Verify the token has write permissions in Directus
2. Check that the collection and field names are correct
3. Look for errors in the browser console

### Elements not clickable

1. Ensure `data-directus` attributes are properly formatted
2. Check that the visual editing provider is initialized
3. Verify the element is not covered by other elements (z-index issues)

## Next Steps

1. Add visual editing attributes to article pages
2. Add visual editing to category pages
3. Configure visual editor URLs in Directus
4. Test editing workflow with content editors
5. Add custom styling for edit overlays (optional)
