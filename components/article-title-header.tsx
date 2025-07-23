'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface ArticleTitleHeaderProps {
  category?: string;
  title: string;
  slug: string;
  description?: string;
  pdfUrl?: string;
}

export function ArticleTitleHeader({ 
  category, 
  title, 
  slug,
  description,
  pdfUrl
}: ArticleTitleHeaderProps) {
  const [isOpenDropdownOpen, setIsOpenDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}${pathname}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      // If we have a PDF URL or ID
      if (pdfUrl) {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.charlotteudo.org';
        let fullPdfUrl: string;
        
        // Check if it's a full URL, a path, or just an ID
        if (pdfUrl.startsWith('http')) {
          fullPdfUrl = pdfUrl;
        } else if (pdfUrl.includes('/')) {
          // It's a path like 'pdfs/file.pdf'
          fullPdfUrl = `${directusUrl}/assets/${pdfUrl}`;
        } else {
          // It's just an ID, use Directus file endpoint
          fullPdfUrl = `${directusUrl}/assets/${pdfUrl}`;
        }
        
        // Open the PDF in a new tab or download it directly
        const a = document.createElement('a');
        a.href = fullPdfUrl;
        a.download = `${slug}.pdf`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fallback to API endpoint
        const response = await fetch(`/api/articles/${slug}/pdf`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${slug}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          console.error('Failed to download PDF');
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  // Handle opening in AI platforms
  const handleOpenInPlatform = (platform: 'chatgpt' | 'claude') => {
    const prompt = `Read ${currentUrl}, I want to ask questions about it.`;
    const encodedPrompt = encodeURIComponent(prompt);
    
    switch (platform) {
      case 'chatgpt':
        window.open(`https://chat.openai.com/?q=${encodedPrompt}`, '_blank');
        break;
      case 'claude':
        window.open(`https://claude.ai/new?q=${encodedPrompt}`, '_blank');
        break;
    }
    setIsOpenDropdownOpen(false);
  };

  return (
    <div className="mb-8 border-b border-fd-border pb-6">
      {/* Category */}
      {category && (
        <div className="text-sm font-medium text-fd-accent-foreground mb-2">
          {category}
        </div>
      )}
      
      {/* Title */}
      <h1 className="text-3xl font-bold text-fd-foreground mb-4">
        {title}
      </h1>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Download PDF Button - Only show if PDF is available */}
        {pdfUrl && (
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-fd-primary-foreground bg-fd-primary hover:bg-fd-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
            onClick={handleDownloadPDF}
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            Download PDF
          </button>
        )}

        {/* Open Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium bg-fd-background border border-fd-border hover:bg-fd-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2"
            onClick={() => setIsOpenDropdownOpen(!isOpenDropdownOpen)}
          >
            Open
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </button>
          
          {isOpenDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md bg-fd-popover shadow-lg ring-1 ring-fd-border z-50">
              <div className="py-1">
                <button
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-fd-popover-foreground hover:bg-fd-accent hover:text-fd-accent-foreground transition-colors"
                  onClick={() => handleOpenInPlatform('chatgpt')}
                >
                  <span className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                    </svg>
                    Open in ChatGPT
                  </span>
                  <ExternalLink className="h-3 w-3 text-fd-muted-foreground" />
                </button>
                <button
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-fd-popover-foreground hover:bg-fd-accent hover:text-fd-accent-foreground transition-colors"
                  onClick={() => handleOpenInPlatform('claude')}
                >
                  <span className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/>
                    </svg>
                    Open in Claude
                  </span>
                  <ExternalLink className="h-3 w-3 text-fd-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      {description && (
        <p className="mt-4 text-fd-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}