'use client'

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface Article {
  name: string;
  slug: string;
  url: string;
}

interface UncategorizedArticlesProps {
  articles: Article[];
}

export function UncategorizedArticles({ articles }: UncategorizedArticlesProps) {
  return (
    <div className="mt-16 space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
        <h2 className="text-xl font-semibold text-foreground px-6">
          Additional Articles
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.a
            key={article.slug}
            href={article.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {article.name}
                </h3>
              </div>
            </Card>
          </motion.a>
        ))}
      </div>
    </div>
  );
}