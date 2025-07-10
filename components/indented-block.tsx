import React from 'react';

interface IndentedBlockProps {
  indent: number;
  children: React.ReactNode;
}

export function IndentedBlock({ indent, children }: IndentedBlockProps) {
  return (
    <div 
      style={{ 
        marginLeft: `${indent * 2}rem`,
        marginBottom: '1rem'
      }}
    >
      {children}
    </div>
  );
}