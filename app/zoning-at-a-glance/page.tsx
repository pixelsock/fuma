'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { 
  Download,
  FileText,
  Search,
  Filter,
  Building,
  Home,
  Store,
  Factory,
  School,
  Train,
  Layers,
  Map,
  Grid3x3,
  ArrowRight,
  Eye,
  ExternalLink,
  Zap,
  Trees,
  Building2,
  Warehouse,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ZoningCategory {
  id: string
  name: string
  icon: React.ElementType
  color: string
  districts: string[]
}

interface ZoningSheet {
  id: string
  name: string
  category: string
  description: string
  thumbnailUrl?: string
  pdfUrl?: string
  characteristics: string[]
}

const zoningCategories: ZoningCategory[] = [
  {
    id: 'neighborhood-1',
    name: 'Neighborhood 1',
    icon: Home,
    color: 'from-green-500 to-green-600',
    districts: ['N1-A', 'N1-B', 'N1-C', 'N1-D', 'N1-E', 'N1-F']
  },
  {
    id: 'neighborhood-2',
    name: 'Neighborhood 2',
    icon: Building,
    color: 'from-blue-500 to-blue-600',
    districts: ['N2-A', 'N2-B', 'N2-C']
  },
  {
    id: 'commercial',
    name: 'Commercial',
    icon: Store,
    color: 'from-purple-500 to-purple-600',
    districts: ['CG', 'CR', 'CC']
  },
  {
    id: 'campus',
    name: 'Campus',
    icon: School,
    color: 'from-indigo-500 to-indigo-600',
    districts: ['CI', 'CIC', 'CIR']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Logistics',
    icon: Factory,
    color: 'from-gray-500 to-gray-600',
    districts: ['ML-1', 'ML-2', 'ML-3']
  },
  {
    id: 'innovation',
    name: 'Innovation Mixed Use',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    districts: ['IM-U']
  },
  {
    id: 'neighborhood-center',
    name: 'Neighborhood Center',
    icon: Trees,
    color: 'from-emerald-500 to-emerald-600',
    districts: ['NC']
  },
  {
    id: 'community-activity',
    name: 'Community Activity Center',
    icon: Building2,
    color: 'from-teal-500 to-teal-600',
    districts: ['CAC-1', 'CAC-2']
  },
  {
    id: 'regional-activity',
    name: 'Regional Activity Center',
    icon: Briefcase,
    color: 'from-red-500 to-red-600',
    districts: ['RAC']
  },
  {
    id: 'transit-oriented',
    name: 'Transit Oriented Development',
    icon: Train,
    color: 'from-orange-500 to-orange-600',
    districts: ['TOD-UC', 'TOD-NC', 'TOD-TR', 'TOD-CC', 'TOD-ES']
  },
  {
    id: 'overlays',
    name: 'Zoning Overlays',
    icon: Layers,
    color: 'from-pink-500 to-pink-600',
    districts: ['PED', 'HD', 'MH', 'MCCO', 'AH']
  }
]

// Sample zoning sheets data
const zoningSheets: ZoningSheet[] = [
  {
    id: 'n1-a',
    name: 'N1-A',
    category: 'neighborhood-1',
    description: 'Low-density residential district with single-family homes',
    characteristics: ['Single-family detached', 'Large lots', 'Low density', 'Suburban character']
  },
  {
    id: 'n1-b',
    name: 'N1-B',
    category: 'neighborhood-1',
    description: 'Low to medium-density residential district',
    characteristics: ['Single-family', 'Some duplexes', 'Medium lots', 'Neighborhood scale']
  },
  {
    id: 'n2-a',
    name: 'N2-A',
    category: 'neighborhood-2',
    description: 'Medium-density mixed residential district',
    characteristics: ['Townhomes', 'Small apartments', 'Mixed housing types', 'Walkable']
  },
  {
    id: 'cg',
    name: 'CG',
    category: 'commercial',
    description: 'General commercial district for retail and services',
    characteristics: ['Retail shops', 'Restaurants', 'Services', 'Auto-oriented']
  },
  {
    id: 'tod-uc',
    name: 'TOD-UC',
    category: 'transit-oriented',
    description: 'Urban core transit-oriented development',
    characteristics: ['High density', 'Mixed-use', 'Transit adjacent', 'Pedestrian priority']
  },
  // Add more sheets as needed
]

interface CategoryButtonProps {
  category: ZoningCategory
  isActive: boolean
  onClick: () => void
  index: number
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isActive, onClick, index }) => {
  const Icon = category.icon
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${isActive 
          ? 'border-primary bg-gradient-to-br ' + category.color + ' text-white shadow-lg' 
          : 'border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-md'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${isActive ? 'bg-white/20' : 'bg-gradient-to-br ' + category.color + ' text-white'}
        `}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium">{category.name}</span>
        <Badge 
          variant={isActive ? "secondary" : "outline"} 
          className={isActive ? "bg-white/20 text-white border-white/30" : ""}
        >
          {category.districts.length} Districts
        </Badge>
      </div>
    </motion.button>
  )
}

interface SheetCardProps {
  sheet: ZoningSheet
  category: ZoningCategory
  index: number
}

const SheetCard: React.FC<SheetCardProps> = ({ sheet, category, index }) => {
  const Icon = category.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden">
        {/* Thumbnail Preview */}
        <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white mx-auto mb-3`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{sheet.name}</h3>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="h-8 px-2">
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 px-2">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {category.name}
            </Badge>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">{sheet.name} - {sheet.description}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Key Characteristics:</p>
              <div className="flex flex-wrap gap-1">
                {sheet.characteristics.map((char, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {char}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" size="sm" variant="outline">
                <Eye className="mr-2 w-3 h-3" />
                Preview
              </Button>
              <Button className="flex-1" size="sm" variant="default">
                <Download className="mr-2 w-3 h-3" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ZoningAtAGlancePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredSheets = zoningSheets.filter(sheet => {
    const matchesCategory = selectedCategory === 'all' || sheet.category === selectedCategory
    const matchesSearch = sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - Extended to top */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent-foreground/20" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, var(--color-fd-primary) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, var(--color-fd-accent-foreground) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, var(--color-fd-primary) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 border-primary text-primary">
              <Map className="mr-1 w-3 h-3" />
              Quick Reference Guides
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Zoning-At-A-Glance Sheets
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Quick reference guides for all Charlotte zoning districts. Download individual sheets or browse by category.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all">
                <Download className="mr-2 w-4 h-4" />
                Download All Sheets
              </Button>
              <Button size="lg" variant="outline" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-white shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/articles/zoning-map">
                  <Map className="mr-2 w-4 h-4" />
                  Interactive Zoning Map
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Zoning Districts by Category</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a category to filter zoning sheets or browse all districts
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${selectedCategory === 'all' 
                  ? 'border-primary bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg' 
                  : 'border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gradient-to-br from-primary to-primary/80 text-white'}
                `}>
                  <Grid3x3 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">All Categories</span>
                <Badge 
                  variant={selectedCategory === 'all' ? "secondary" : "outline"} 
                  className={selectedCategory === 'all' ? "bg-white/20 text-white border-white/30" : ""}
                >
                  {zoningSheets.length} Sheets
                </Badge>
              </div>
            </motion.button>
            
            {zoningCategories.map((category, index) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="py-8 bg-muted/30 sticky top-16 z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search zoning districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sheets Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedCategory === 'all' 
                  ? 'All Zoning Sheets' 
                  : zoningCategories.find(cat => cat.id === selectedCategory)?.name + ' Districts'
                }
              </h2>
              <p className="text-muted-foreground">
                Showing {filteredSheets.length} of {zoningSheets.length} sheets
              </p>
            </div>
          </motion.div>
          
          {filteredSheets.length > 0 ? (
            <div className={`
              grid gap-6
              ${viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
              }
            `}>
              {filteredSheets.map((sheet, index) => {
                const category = zoningCategories.find(cat => cat.id === sheet.category)!
                return (
                  <SheetCard
                    key={sheet.id}
                    sheet={sheet}
                    category={category}
                    index={index}
                  />
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sheets found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help Understanding Zoning?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our planning staff is here to help you navigate zoning requirements and find the information you need.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                Contact Planning Staff
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
                asChild
              >
                <Link href="/articles/udo-university">
                  <School className="mr-2 w-4 h-4" />
                  UDO University
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}