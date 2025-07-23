import React from 'react';

interface IndentBlockProps {
  level?: number;
  children: React.ReactNode;
  type?: 'default' | 'requirement' | 'code' | 'note';
  className?: string;
}

export function IndentBlock({ 
  level = 1, 
  children, 
  type = 'default',
  className 
}: IndentBlockProps) {
  const paddingLeft = `${level * 2}rem`;
  
  // Different styling based on content type
  const typeStyles = {
    default: 'border-l-2 border-gray-300',
    requirement: 'border-l-4 border-blue-500 bg-blue-50',
    code: 'border-l-4 border-green-500 bg-gray-50 font-mono text-sm',
    note: 'border-l-4 border-yellow-500 bg-yellow-50',
  };
  
  return (
    <div 
      style={{ paddingLeft, marginBottom: '1rem' }}
      className={`indent-block-${level} ${typeStyles[type]} ${className || ''} pl-4 py-2`}
    >
      {children}
    </div>
  );
}