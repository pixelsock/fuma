'use client';

import dynamic from 'next/dynamic';

// Export a dynamic version for SSR compatibility
export const EnhancedTableDynamic = dynamic(
  () => import('./enhanced-table').then(mod => ({ default: mod.EnhancedTable })),
  { ssr: false }
);

import React, { useState, useEffect, useRef } from 'react';
import { Search, Maximize2, X } from 'lucide-react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function EnhancedTable({ children, className = '' }: TableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableContent, setTableContent] = useState<React.ReactNode>(children);

  // Filter table rows based on search term
  useEffect(() => {
    if (!searchTerm || !tableRef.current) {
      setTableContent(children);
      return;
    }

    const tableElement = tableRef.current.querySelector('table');
    if (!tableElement) {
      setTableContent(children);
      return;
    }

    // Clone the table to manipulate it
    const clonedTable = tableElement.cloneNode(true) as HTMLTableElement;
    const rows = Array.from(clonedTable.querySelectorAll('tr'));
    
    // Keep header rows (first row or rows with th elements)
    const headerRows: HTMLTableRowElement[] = [];
    const bodyRows: HTMLTableRowElement[] = [];
    
    rows.forEach((row, index) => {
      if (index === 0 || row.querySelector('th')) {
        headerRows.push(row);
      } else {
        bodyRows.push(row);
      }
    });

    // Filter body rows
    const searchLower = searchTerm.toLowerCase();
    bodyRows.forEach(row => {
      const text = row.textContent?.toLowerCase() || '';
      if (text.includes(searchLower)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Check if any rows are visible
    const hasVisibleRows = bodyRows.some(row => row.style.display !== 'none');
    
    if (!hasVisibleRows) {
      setTableContent(
        <div className="text-center py-8 text-gray-500">
          No results found for "{searchTerm}"
        </div>
      );
    } else {
      setTableContent(<div dangerouslySetInnerHTML={{ __html: clonedTable.outerHTML }} />);
    }
  }, [searchTerm, children]);

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const tableWrapperClass = `enhanced-table-wrapper ${className} ${
    isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''
  }`;

  return (
    <>
      <div className={tableWrapperClass}>
        <div className="enhanced-table-container">
          {/* Controls Bar */}
          <div className="table-controls flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="ml-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleFullscreenToggle}
              title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            >
              {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Table Container */}
          <div 
            ref={tableRef}
            className="table-container overflow-x-auto"
            style={{ maxHeight: isFullscreen ? 'calc(100vh - 120px)' : '600px' }}
          >
            {tableContent}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to check if a table should be enhanced
function shouldEnhanceTable(element: React.ReactElement): boolean {
  // Check if table has many rows
  let rowCount = 0;
  let hasComplexContent = false;
  
  React.Children.forEach((element.props as any).children, (child: any) => {
    if (child?.type === 'thead' || child?.type === 'tbody' || child?.type === 'tfoot') {
      React.Children.forEach((child.props as any).children, (row: any) => {
        if (row?.type === 'tr') rowCount++;
      });
    } else if (child?.type === 'tr') {
      rowCount++;
    }
    
    // Check for UDO-specific content
    const childString = JSON.stringify(child);
    if (childString && (childString.includes('N1-') || childString.includes('**'))) {
      hasComplexContent = true;
    }
  });
  
  // Enhance tables with more than 5 rows or complex content
  return rowCount > 5 || hasComplexContent;
}

// Export a wrapper component for MDX tables
export function Table(props: React.HTMLAttributes<HTMLTableElement>) {
  const tableElement = <table {...props} />;
  
  // Check if this is a complex table that should be enhanced
  if (!shouldEnhanceTable(tableElement)) {
    // For simple tables, just render normally with basic styling
    return (
      <div className="overflow-x-auto my-6">
        {tableElement}
      </div>
    );
  }

  // For complex tables, wrap in enhanced component
  return (
    <EnhancedTable>
      {tableElement}
    </EnhancedTable>
  );
}