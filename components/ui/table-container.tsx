import React from 'react';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable table container with rounded border and horizontal scroll support.
 * Matches the design pattern used across articles-listing and supporting-documents pages.
 */
export function TableContainer({ children, className = '' }: TableContainerProps) {
  return (
    <div className={`rounded-md border overflow-hidden ${className}`}>
      <div className="relative w-full overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
