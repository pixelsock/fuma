'use client';

import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface SearchRedirectInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchRedirectInput({ placeholder, className }: SearchRedirectInputProps) {
  const router = useRouter();
  
  const handleFocus = () => {
    router.push('/articles-enhanced');
  };
  
  return (
    <Input
      placeholder={placeholder}
      className={className}
      onFocus={handleFocus}
    />
  );
}