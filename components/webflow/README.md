# Charlotte UDO Webflow Components

This directory contains React components optimized for import into Webflow using DevLink. These components recreate the articles page functionality with the exact same design and behavior as the current implementation.

## Components

### ArticlesTableWebflow
- **Full-featured table view** with search, filtering, and sorting
- **Grid/List view toggle**
- **Category filtering** with color-coded badges
- **Responsive design** matching current CSS
- **Mock data included** for testing

### ArticlesGridWebflow
- **Grid layout** with category grouping
- **Search functionality**
- **Responsive columns** (2, 3, or 4 columns)
- **Color-coded categories**
- **Mock data included** for testing

## Setup Instructions

### Prerequisites
1. **Webflow account** with CMS or Business Site plan
2. **DevLink CLI** installed globally
3. **Node.js 18+** and npm

### Step 1: Install DevLink CLI
```bash
npm install -g @webflow/devlink
```

### Step 2: Install Dependencies
```bash
cd components/webflow
npm install
```

### Step 3: Authenticate with Webflow
```bash
devlink auth
```

### Step 4: Import Components to Webflow
```bash
# Start development mode
npm run dev

# Or build and sync to production
npm run build
npm run sync
```

### Step 5: Use Components in Webflow
1. Open Webflow Designer
2. Navigate to your Articles page
3. Add the imported React components from the component panel
4. Configure props as needed:
   - **articles**: Array of article data
   - **categories**: Array of category data
   - **theme**: 'light' or 'dark'
   - **maxWidth**: Container max-width
   - **columns**: Grid columns (2, 3, or 4)

## Component Props

### ArticlesTableWebflow Props
```typescript
interface ArticlesTableWebflowProps {
  articles?: WebflowArticle[];
  categories?: WebflowCategory[];
  maxWidth?: string;
  theme?: 'light' | 'dark';
}
```

### ArticlesGridWebflow Props
```typescript
interface ArticlesGridWebflowProps {
  articles?: WebflowArticle[];
  categories?: WebflowCategory[];
  maxWidth?: string;
  theme?: 'light' | 'dark';
  columns?: 2 | 3 | 4;
}
```

### Data Interfaces
```typescript
interface WebflowArticle {
  id: string;
  name: string;
  slug: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  pdf?: string;
}

interface WebflowCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
}
```

## Webflow Integration

### Design System Variables
The following Webflow variables have been created and match your current CSS:

**Colors:**
- `Brand/Brand Primary`: #008b94 (teal)
- `Brand/Brand Accent`: #f96f16 (orange)

**Spacing:**
- `Gap/Gap Charlotte UDO`: 3.52px (0.22rem)
- `Radius/Radius Charlotte UDO`: 7.2px (0.45rem)

### Page Structure
1. **Create Articles page** in Webflow
2. **Add Section** with container
3. **Import ArticlesTableWebflow** or **ArticlesGridWebflow** component
4. **Configure component props** for data and styling
5. **Style with Webflow variables** for consistency

## Mock Data
Both components include comprehensive mock data for testing:
- 6 sample articles across 4 categories
- Color-coded categories matching current design
- Proper article numbering and slugs

## Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Components will be available in Webflow Designer
# Changes sync automatically during development
```

### Production Deployment
```bash
# Build components
npm run build

# Deploy to Webflow
npm run deploy
```

## Features Included

✅ **Search functionality** - Filter articles by name, slug, or category
✅ **Category filtering** - Add/remove category filters with pills
✅ **View mode toggle** - Switch between grid and list views
✅ **Sorting** - Sort by article number, name, or category
✅ **Responsive design** - Mobile-first responsive layouts
✅ **Color-coded categories** - Dynamic category colors
✅ **PDF links** - External links to article PDFs
✅ **Hover states** - Interactive hover effects
✅ **Accessibility** - Proper semantic markup and focus states
✅ **Theme support** - Light and dark mode compatible

## Next Steps (Phase 2)

1. **Connect to Directus CMS** - Replace mock data with live content
2. **Add more interactions** - Enhanced filtering and search
3. **Performance optimization** - Lazy loading and virtualization
4. **Analytics integration** - Track article views and searches

## File Structure
```
components/webflow/
├── articles-table-webflow.tsx    # Table component
├── articles-grid-webflow.tsx     # Grid component
├── index.ts                      # Component exports
├── devlink.config.ts            # DevLink configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Support

For questions about DevLink integration or component usage, refer to:
- [Webflow DevLink Documentation](https://developers.webflow.com/code-components)
- [DevLink CLI Reference](https://developers.webflow.com/devlink/cli)

## Design System Match

These components exactly match your current design system:
- **Colors**: Teal primary (#008b94), Orange accent (#f96f16)
- **Typography**: System fonts with proper hierarchy
- **Spacing**: 0.22rem base spacing throughout
- **Borders**: 0.45rem border radius consistently applied
- **Shadows**: Custom 3.5px offset shadows
- **Layout**: Responsive grid and table layouts
- **Interactions**: All hover states and transitions preserved