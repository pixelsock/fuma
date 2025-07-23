'use client'

import Link from 'next/link';
import { FileText, ArrowRight, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description?: string;
    articles: Array<{
      name: string;
      slug: string;
      url: string;
    }>;
  };
  index?: number;
  showAllArticles?: boolean;
}

export function CategoryCard({ category, index = 0, showAllArticles = false }: CategoryCardProps) {
  const articlesToShow = showAllArticles ? category.articles : category.articles.slice(0, 4);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
              <FolderOpen className="w-6 h-6" />
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              {category.articles.length} {category.articles.length === 1 ? 'Article' : 'Articles'}
            </Badge>
          </div>
          <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
            {category.name}
          </CardTitle>
          {category.description && (
            <CardDescription className="text-muted-foreground mt-2">
              {category.description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          <div className={`${showAllArticles ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'} mb-4`}>
            {articlesToShow.map(article => (
              <Link 
                key={article.slug} 
                href={article.url} 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className={showAllArticles ? '' : 'truncate'}>{article.name}</span>
                </span>
              </Link>
            ))}
          </div>
          
          {!showAllArticles && (
            <>
              {category.articles.length > 4 && (
                <p className="text-xs text-muted-foreground italic mb-4">
                  +{category.articles.length - 4} more {category.articles.length - 4 === 1 ? 'article' : 'articles'}
                </p>
              )}
              <Link 
                href={`/articles/${category.slug}`} 
                className="inline-flex items-center text-primary text-sm font-medium hover:underline group/link"
              >
                View all articles 
                <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}