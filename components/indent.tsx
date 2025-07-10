import React from 'react';

interface IndentProps {
  level: number;
  children: React.ReactNode;
}

export function Indent({ level, children }: IndentProps) {
  return (
    <div className={`indent-block-${level}`}>
      {children}
    </div>
  );
}