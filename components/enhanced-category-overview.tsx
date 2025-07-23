'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  ArrowRight, 
  Building, 
  Home, 
  Factory, 
  MapPin, 
  Shield, 
  FileText, 
  Users, 
  Settings,
  Search,
  Zap,
  Book,
  Target,
  Layers,
  Map,
  List
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Category {
  name: string
  slug: string
  description?: string
  articles: Array<{
    name: string
    slug: string
    url: string
  }>
}

interface EnhancedCategoryOverviewProps {
  categories: Category[]
  title?: string
  description?: string
}

// Icon mapping for different category types
const getCategoryIcon = (slug: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'part-i-ordinance-introduction': Book,
    'part-ii-zoning-introduction': Map,
    'part-iii-neighborhood-zoning-districts': Home,
    'part-iv-employment-zoning-districts': Building,
    'part-v-centers-zoning-districts': Target,
    'part-vi-special-purpose-overlay-zoning-districts': Layers,
    'part-vii-uses': Settings,
    'part-viii-general-development-zoning-standards': Shield,
    'part-ix-stormwater': Zap,
    'part-x-subdivision-streets-other-infrastructure': MapPin,
    'part-xi-administration': Users,
    'part-xii-nonconformities': FileText,
    'part-xiii-enforcement': Factory,
  }
  
  return iconMap[slug] || FolderOpen
}

// Color schemes for different categories
const getCategoryColor = (slug: string, index: number) => {
  const colorSchemes = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600', 
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
    'from-amber-500 to-amber-600',
    'from-lime-500 to-lime-600',
    'from-rose-500 to-rose-600',
    'from-violet-500 to-violet-600',
  ]
  
  return colorSchemes[index % colorSchemes.length]
}

// All cards use standard size for regular grid layout
const getCardSize = () => {
  return '' // No special sizing, all cards are equal
}

const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const Icon = getCategoryIcon(category.slug)
  const colorScheme = getCategoryColor(category.slug, index)
  const cardSize = getCardSize()
  const isHero = false // No hero cards in regular grid
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group ${cardSize}`}
    >
      <Link href={`/articles/${category.slug}`} className="block h-full">
        <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-2xl cursor-pointer overflow-hidden">
          {/* Background Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme} opacity-5 group-hover:opacity-10 transition-opacity`} />
          
          <CardHeader className="relative pb-3">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                {category.articles.length} {category.articles.length === 1 ? 'Article' : 'Articles'}
              </Badge>
            </div>
            
            <CardTitle className="text-lg mb-2 text-foreground group-hover:text-primary transition-colors leading-tight">
              {category.name}
            </CardTitle>
            
            {category.description && (
              <CardDescription className="text-muted-foreground text-sm line-clamp-2">
                {category.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="relative pt-0">
            <div className="space-y-4">
              {/* Article Preview */}
              <div className="space-y-1">
                {category.articles.slice(0, 2).map((article, idx) => (
                  <div key={article.slug} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="w-3 h-3 flex-shrink-0 opacity-60" />
                    <span className="truncate">{article.name}</span>
                  </div>
                ))}
                {category.articles.length > 2 && (
                  <p className="text-xs text-muted-foreground/60 italic">
                    +{category.articles.length - 2} more
                  </p>
                )}
              </div>
              
              {/* Action */}
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center text-primary text-sm font-medium">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse articles
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

const StatCard = ({ label, value, delay }: { label: string; value: number; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className="text-center"
  >
    <div className="text-3xl font-bold text-primary mb-1">
      {value}
    </div>
    <div className="text-sm text-muted-foreground">
      {label}
    </div>
  </motion.div>
)

export function EnhancedCategoryOverview({ 
  categories, 
  title = "Charlotte UDO Articles",
  description = "Browse all articles of the Charlotte Unified Development Ordinance organized by category"
}: EnhancedCategoryOverviewProps) {
  const totalArticles = categories.reduce((sum, cat) => sum + cat.articles.length, 0)
  const categoriesWithArticles = categories.filter(cat => cat.articles.length > 0)
  
  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex justify-center gap-12 py-6">
          <StatCard label="Total Articles" value={totalArticles} delay={0.1} />
          <StatCard label="Categories" value={categoriesWithArticles.length} delay={0.2} />
          <StatCard label="Parts" value={13} delay={0.3} />
        </div>
      </motion.div>

      {/* Search Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/articles-enhanced?view=grid">
              <Search className="mr-2 w-4 h-4" />
              Search All Articles
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/articles-enhanced?view=list">
              <List className="mr-2 w-4 h-4" />
              Browse as Table
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Categories Regular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesWithArticles.map((category, index) => (
          <CategoryCard
            key={category.slug}
            category={category}
            index={index}
          />
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl p-8"
      >
        <h2 className="text-2xl font-bold mb-4">Need Help Navigating the UDO?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Our comprehensive guide includes detailed explanations, visual examples, and step-by-step instructions 
          to help you understand Charlotte's development regulations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/articles/udo-university">
              <Book className="mr-2 w-4 h-4" />
              UDO University
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/text-amendments">
              <FileText className="mr-2 w-4 h-4" />
              Text Amendments
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 