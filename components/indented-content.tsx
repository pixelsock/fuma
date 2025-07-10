import React from 'react';

interface IndentedContentProps {
  children: React.ReactNode;
  level?: number;
}

export function IndentedContent({ children, level = 1 }: IndentedContentProps) {
  const indentClass = `ml-${level * 8}`;
  
  return (
    <div className={indentClass} style={{ marginLeft: `${level * 2}rem` }}>
      {children}
    </div>
  );
}

// Component to parse and render content with proper indentation
export function ParsedContent({ children }: { children: React.ReactNode }) {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  // Split content into lines and detect indentation
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  lines.forEach((line, index) => {
    // Count leading spaces
    const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0;
    const indentLevel = Math.floor(leadingSpaces / 2);
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      // Empty line - flush current paragraph
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`}>{currentParagraph.join(' ')}</p>
        );
        currentParagraph = [];
      }
      elements.push(<br key={`br-${index}`} />);
    } else if (indentLevel > 0) {
      // Indented content
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`}>{currentParagraph.join(' ')}</p>
        );
        currentParagraph = [];
      }
      elements.push(
        <div 
          key={`indent-${index}`} 
          style={{ marginLeft: `${indentLevel * 2}rem` }}
        >
          {trimmedLine}
        </div>
      );
    } else {
      // Regular paragraph content
      currentParagraph.push(trimmedLine);
    }
  });

  // Flush any remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key="p-final">{currentParagraph.join(' ')}</p>
    );
  }

  return <>{elements}</>;
}