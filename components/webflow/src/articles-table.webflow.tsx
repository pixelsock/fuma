import { declareComponent } from '@webflow/react';
import React, { useState, useMemo } from 'react';

// Article interface for Webflow
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

// Category interface for Webflow
interface WebflowCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

type SortKey = 'name' | 'category';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

// Mock data for testing
const mockArticles: WebflowArticle[] = [
  {
    id: '1',
    name: 'Article 1: Title, Purpose, Applicability',
    slug: 'article-1-title-purpose-applicability',
    category: {
      id: 'cat1',
      name: 'Ordinance Introduction',
      slug: 'ordinance-introduction',
      color: '#008b94'
    },
    pdf: '/docs/article-1.pdf'
  },
  {
    id: '2',
    name: 'Article 2: Rules of Interpretation and Definitions',
    slug: 'article-2-rules-interpretation-definitions',
    category: {
      id: 'cat1',
      name: 'Ordinance Introduction',
      slug: 'ordinance-introduction',
      color: '#008b94'
    },
    pdf: '/docs/article-2.pdf'
  },
  {
    id: '3',
    name: 'Article 3: Zoning Districts',
    slug: 'article-3-zoning-districts',
    category: {
      id: 'cat2',
      name: 'Zoning Standards',
      slug: 'zoning-standards',
      color: '#f96f16'
    },
    pdf: '/docs/article-3.pdf'
  },
  {
    id: '4',
    name: 'Article 4: Development Standards',
    slug: 'article-4-development-standards',
    category: {
      id: 'cat2',
      name: 'Zoning Standards',
      slug: 'zoning-standards',
      color: '#f96f16'
    },
    pdf: '/docs/article-4.pdf'
  },
  {
    id: '5',
    name: 'Article 5: Land Use Standards',
    slug: 'article-5-land-use-standards',
    category: {
      id: 'cat3',
      name: 'Land Use',
      slug: 'land-use',
      color: '#10b981'
    },
    pdf: '/docs/article-5.pdf'
  },
  {
    id: '6',
    name: 'Article 6: Supplemental Standards',
    slug: 'article-6-supplemental-standards',
    category: {
      id: 'cat4',
      name: 'Special Requirements',
      slug: 'special-requirements',
      color: '#8b5cf6'
    },
    pdf: '/docs/article-6.pdf'
  }
];

const mockCategories: WebflowCategory[] = [
  { id: 'cat1', name: 'Ordinance Introduction', slug: 'ordinance-introduction', color: '#008b94' },
  { id: 'cat2', name: 'Zoning Standards', slug: 'zoning-standards', color: '#f96f16' },
  { id: 'cat3', name: 'Land Use', slug: 'land-use', color: '#10b981' },
  { id: 'cat4', name: 'Special Requirements', slug: 'special-requirements', color: '#8b5cf6' }
];

const ArticlesTable = ({ articles = mockArticles, categories = mockCategories, maxWidth = '100%', theme = 'light' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Filter and sort logic
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategories.length === 0 ||
        (article.category && selectedCategories.includes(article.category.id));

      return matchesSearch && matchesCategory;
    });

    // Sort articles
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;

      if (sortKey === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      } else {
        aValue = a[sortKey];
        bValue = b[sortKey];
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [articles, searchTerm, selectedCategories, sortKey, sortDirection]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const containerStyles = {
    width: '100%',
    maxWidth: maxWidth,
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    color: theme === 'dark' ? '#f9fafb' : '#111827',
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', margin: 0 }}>
          Charlotte UDO Articles
        </h2>

        {/* Search and View Toggle */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '8px 12px',
              border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#f9fafb' : '#111827'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                backgroundColor: viewMode === 'list' ? '#008b94' : (theme === 'dark' ? '#374151' : '#ffffff'),
                color: viewMode === 'list' ? '#ffffff' : (theme === 'dark' ? '#f9fafb' : '#111827'),
                cursor: 'pointer'
              }}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '6px',
                backgroundColor: viewMode === 'grid' ? '#008b94' : (theme === 'dark' ? '#374151' : '#ffffff'),
                color: viewMode === 'grid' ? '#ffffff' : (theme === 'dark' ? '#f9fafb' : '#111827'),
                cursor: 'pointer'
              }}
            >
              Grid
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: selectedCategories.includes(category.id)
                  ? category.color
                  : (theme === 'dark' ? '#4b5563' : '#f3f4f6'),
                color: selectedCategories.includes(category.id)
                  ? '#ffffff'
                  : (theme === 'dark' ? '#f9fafb' : '#374151'),
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {category.name}
              {selectedCategories.includes(category.id) && ' ✕'}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Display */}
      {viewMode === 'list' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'}` }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>
                  <button
                    onClick={() => toggleSort('name')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontWeight: 'inherit',
                      fontSize: 'inherit'
                    }}
                  >
                    Article Name {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>
                  <button
                    onClick={() => toggleSort('category')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontWeight: 'inherit',
                      fontSize: 'inherit'
                    }}
                  >
                    Category {sortKey === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedArticles.map(article => (
                <tr
                  key={article.id}
                  style={{
                    borderBottom: `1px solid ${theme === 'dark' ? '#374151' : '#f3f4f6'}`,
                    transition: 'background-color 0.2s'
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{article.name}</div>
                    <div style={{ fontSize: '14px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                      {article.slug}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {article.category && (
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: article.category.color,
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {article.category.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {article.pdf && (
                      <a
                        href={article.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#008b94',
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        View PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {filteredAndSortedArticles.map(article => (
            <div
              key={article.id}
              style={{
                padding: '16px',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {article.name}
              </h3>
              <p style={{ fontSize: '14px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', margin: '0 0 12px 0' }}>
                {article.slug}
              </p>
              {article.category && (
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: article.category.color,
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {article.category.name}
                  </span>
                </div>
              )}
              {article.pdf && (
                <a
                  href={article.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#008b94',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  View PDF →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
          No articles found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default declareComponent(ArticlesTable, {
  displayName: 'Articles Table',
  description: 'A searchable and filterable table/grid view of Charlotte UDO articles',
  props: {
    articles: {
      type: 'array',
      displayName: 'Articles',
      description: 'Array of article objects to display',
      defaultValue: mockArticles
    },
    categories: {
      type: 'array',
      displayName: 'Categories',
      description: 'Array of category objects for filtering',
      defaultValue: mockCategories
    },
    maxWidth: {
      type: 'string',
      displayName: 'Max Width',
      description: 'Maximum width of the component',
      defaultValue: '100%'
    },
    theme: {
      type: 'enum',
      displayName: 'Theme',
      description: 'Visual theme of the component',
      options: ['light', 'dark'],
      defaultValue: 'light'
    }
  }
});