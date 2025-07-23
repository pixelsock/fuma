'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun, Palette, Maximize2, Minimize2, Zap } from 'lucide-react';

export interface ThemeManagerProps {
  showSizeToggle?: boolean;
  showColorToggle?: boolean;
  className?: string;
}

export function ThemeManager({ 
  showSizeToggle = true, 
  showColorToggle = true, 
  className = '' 
}: ThemeManagerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sizeMode, setSizeMode] = useState<'compact' | 'comfortable'>('comfortable');

  useEffect(() => {
    setMounted(true);
    // Load size mode from localStorage
    const savedSize = localStorage.getItem('charlotte-size-mode');
    if (savedSize === 'compact' || savedSize === 'comfortable') {
      setSizeMode(savedSize);
      applyThemeSize(savedSize);
    }
  }, []);

  const applyThemeSize = (size: 'compact' | 'comfortable') => {
    document.documentElement.classList.remove('theme-compact', 'theme-comfortable');
    document.documentElement.classList.add(`theme-${size}`);
    
    // Load the appropriate CSS file
    const existingLink = document.querySelector('link[data-theme-size]');
    if (existingLink) {
      existingLink.remove();
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/themes/charlotte-${size}.css`;
    link.setAttribute('data-theme-size', size);
    document.head.appendChild(link);
  };

  const toggleSizeMode = () => {
    const newSize = sizeMode === 'compact' ? 'comfortable' : 'compact';
    setSizeMode(newSize);
    localStorage.setItem('charlotte-size-mode', newSize);
    applyThemeSize(newSize);
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      case 'charlotte-blue':
        return <div className="w-3 h-3 bg-charlotte-blue rounded-full" />;
      case 'charlotte-purple':
        return <div className="w-3 h-3 bg-charlotte-purple rounded-full" />;
      case 'charlotte-green':
        return <div className="w-3 h-3 bg-charlotte-green rounded-full" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  const getSizeIcon = () => {
    return sizeMode === 'compact' ? (
      <Minimize2 className="w-4 h-4" />
    ) : (
      <Maximize2 className="w-4 h-4" />
    );
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
    { value: 'charlotte-blue', label: 'Charlotte Blue', icon: <div className="w-3 h-3 bg-blue-500 rounded-full" /> },
    { value: 'charlotte-purple', label: 'Charlotte Purple', icon: <div className="w-3 h-3 bg-purple-500 rounded-full" /> },
    { value: 'charlotte-green', label: 'Charlotte Green', icon: <div className="w-3 h-3 bg-green-500 rounded-full" /> },
  ];

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-32 h-8 bg-secondary rounded-md animate-pulse" />
        {showSizeToggle && <div className="w-8 h-8 bg-secondary rounded-md animate-pulse" />}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showColorToggle && (
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 pr-8 min-w-[140px]"
            aria-label="Select theme"
          >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            {getThemeIcon(theme || 'system')}
          </div>
        </div>
      )}
      
      {showSizeToggle && (
        <button
          onClick={toggleSizeMode}
          className="flex items-center justify-center w-8 h-8 bg-background border border-border rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          aria-label={`Switch to ${sizeMode === 'compact' ? 'comfortable' : 'compact'} mode`}
          title={`Switch to ${sizeMode === 'compact' ? 'comfortable' : 'compact'} mode`}
        >
          {getSizeIcon()}
        </button>
      )}
    </div>
  );
}

export default ThemeManager;