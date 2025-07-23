'use client';

import React, { useState } from 'react';
import { LinkIcon } from 'lucide-react';

interface HeadingLinkProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function HeadingLink({ id, children, className = '' }: HeadingLinkProps) {
  const [showIcon, setShowIcon] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Construct the full URL with the hash
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <h2 
      id={id}
      className={`group relative ${className}`}
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
    >
      {children}
      <button
        onClick={handleCopyLink}
        className={`
          absolute -right-7 top-1/2 -translate-y-1/2
          p-1.5 rounded-md transition-all duration-200
          ${showIcon || copied ? 'opacity-100' : 'opacity-0'}
          hover:bg-gray-100 dark:hover:bg-gray-800
          focus:outline-none focus:ring-2 focus:ring-primary-500
        `}
        aria-label="Copy link to section"
      >
        {copied ? (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Copied!
          </span>
        ) : (
          <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>
    </h2>
  );
}