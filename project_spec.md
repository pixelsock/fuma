# Charlotte UDO Documentation System - Project Specification

## Project Overview
Charlotte Unified Development Ordinance (UDO) documentation system built with Next.js 15, Fumadocs UI, and Directus CMS. The system provides a modern, searchable interface for city ordinance documentation with advanced features like AI-powered search, dynamic tables, and comprehensive content management.

## Repository Structure
```
charlotteUDO/
├── directus/
│   ├── frontend-fumadocs/
│   │   └── fuma/               # Main Next.js application
│   └── [directus backend]      # Headless CMS
├── source-docs/                 # Original Word documents
└── scripts/                     # Processing utilities
```

## Technology Stack
- **Frontend**: Next.js 15.3.2 with App Router
- **UI Framework**: Fumadocs UI (notebook layout)
- **Styling**: Tailwind CSS with Charlotte UDO theme and Shadcn UI using the shadcnui-mcp server. 
- **CMS**: Directus (headless)
- **Database**: PostgreSQL
- **Search**: Orama Cloud Search
- **Tables**: AG-Grid for complex data tables
- **Deployment**: Render.com

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- PostgreSQL (for Directus)
- Git

### Installation
```bash
# Clone repository
git clone [repository-url]
cd charlotteUDO/directus/frontend-fumadocs/fuma

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure Directus API URL and other secrets
```

### Environment Variables
```env
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8056
DIRECTUS_STATIC_TOKEN=[your-token]
NEXT_PUBLIC_PERPLEXITY_API_KEY=[api-key]
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Tmux Session Configuration

### Recommended Tmux Layout
```
Session: charlotte-udo
├── Window 1: Editor
│   └── Pane 1: nvim/vim (main editing)
├── Window 2: Dev Server
│   ├── Pane 1: npm run dev (Next.js)
│   └── Pane 2: System logs/monitoring
├── Window 3: Terminal
│   ├── Pane 1: Git operations
│   └── Pane 2: General commands
├── Window 4: Directus
│   └── Pane 1: Directus server (if running locally)
└── Window 5: Database
    └── Pane 1: PostgreSQL client
```

### Tmux Orchestrator Config
```yaml
name: charlotte-udo
root: ~/Sites/charlotteUDO/directus/frontend-fumadocs/fuma

windows:
  - editor:
      layout: main-vertical
      panes:
        - vim .
  
  - server:
      layout: even-horizontal
      panes:
        - npm run dev
        - tail -f .next/trace
  
  - terminal:
      layout: even-horizontal
      panes:
        - # git status
        - # general commands
  
  - directus:
      root: ~/Sites/charlotteUDO/directus/backend
      panes:
        - # directus start (if local)
  
  - database:
      panes:
        - # psql commands
```

## Key Features

### 1. Dynamic Content Loading
- Articles loaded from Directus CMS
- Real-time content updates
- Category-based organization

### 2. Advanced Search
- AI-powered search with Perplexity
- Full-text search across all articles
- Search highlighting and navigation

### 3. Rich Content Rendering
- Custom UDO content renderer
- Dynamic table rendering with AG-Grid
- Definition tooltips
- PDF generation support

### 4. Navigation
- Sidebar with category organization
- Table of Contents with scroll spy
- Breadcrumb navigation
- Mobile-responsive design

### 5. Theme System
- Charlotte UDO branding
- Dark mode support
- Custom color scheme (teal/turquoise primary, orange accents)

## Project Structure

### Key Directories
```
app/
├── (home)/                 # Landing page
├── articles/              # Article pages
│   └── [[...slug]]/      # Dynamic article routing
├── layout.tsx            # Root layout
├── global.css           # Global styles
└── themes/              # Theme configurations

components/
├── udo-content-renderer-v3-optimized.tsx  # Main content renderer
├── article-title-header.tsx              # Article header
├── articles-table.tsx                    # Articles listing
├── search-navigation-wrapper.tsx         # Search functionality
└── shared-docs-layout.tsx              # Shared layout wrapper

lib/
├── directus-source.ts    # CMS data fetching
├── unified-source.ts     # Unified data source
└── directus-client.ts    # Directus API client

styles/
├── udo-tables.css       # Table styling
├── ag-grid-udo.css      # AG-Grid theme
└── charlotte-theme.css  # Main theme
```

### Important Files
- `app/layout.config.tsx` - Layout configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind setup
- `tsconfig.json` - TypeScript configuration

## Common Development Tasks

### Adding a New Page
1. Create new route in `app/` directory
2. Use `SharedDocsLayout` wrapper
3. Configure sidebar visibility as needed

### Modifying Theme
1. Edit `app/themes/charlotte-theme.css`
2. Update CSS variables for colors
3. Test in both light and dark modes

### Working with Articles
1. Articles are fetched from Directus
2. Use `unifiedSource.getPage()` for data
3. Render with `UDOContentRendererV3Optimized`

### Search Implementation
1. Search uses Perplexity API
2. Results highlighted in content
3. Navigation between results supported

## Debugging Tips

### Common Issues
1. **TOC not showing active state**: Check AnchorProvider/ScrollProvider setup
2. **Tables not rendering**: Verify AG-Grid initialization
3. **Search not working**: Check API keys and CORS settings
4. **Content not loading**: Verify Directus connection

### Debug Tools
- React Developer Tools
- Next.js built-in debugger
- Browser console for client-side errors
- Server logs for API issues

## Performance Considerations
- Static generation where possible
- Dynamic imports for heavy components
- Image optimization with Next.js Image
- Lazy loading for tables
- Caching strategies for CMS data

## Deployment
- Build optimizations for production
- Environment variable configuration
- CDN setup for static assets
- Database connection pooling
- Error monitoring setup

## Contributing Guidelines
- Follow existing code patterns
- Maintain TypeScript types
- Test responsive design
- Ensure accessibility compliance
- Document significant changes

## Additional Resources
- [Fumadocs Documentation](https://fumadocs.vercel.app)
- [Next.js Documentation](https://nextjs.org/docs)
- [Directus Documentation](https://docs.directus.io)
- [AG-Grid Documentation](https://www.ag-grid.com/documentation)