'use client'

import Link from 'next/link';
import { FileText, ArrowRight, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ArticleCardProps {
  article: {
    name: string;
    slug: string;
    url: string;
    description?: string;
    date?: string;
    tags?: string[];
  };
  index?: number;
}

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group h-full"
    >
      <Link href={article.url} className="block h-full">
        <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl cursor-pointer">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              {article.tags && article.tags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {article.tags[0]}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {article.name}
            </CardTitle>
            {article.description && (
              <CardDescription className="text-muted-foreground mt-2 line-clamp-3">
                {article.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              {article.date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{article.date}</span>
                </div>
              )}
              <div className="flex items-center text-primary text-sm font-medium">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Read more</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}