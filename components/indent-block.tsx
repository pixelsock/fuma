import React from 'react';

interface IndentBlockProps {
  level: number;
  children: React.ReactNode;
}

export function IndentBlock({ level, children }: IndentBlockProps) {
  const marginLeft = `${level * 2}rem`;
  
  return (
    <div 
      style={{ marginLeft, marginBottom: '1rem' }}
      className={`indent-block-${level}`}
    >
      {children}
    </div>
  );
}