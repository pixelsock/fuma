'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MaterialIcon } from '@/components/material-icon'

interface FeatureCardProps {
  iconName: string
  title: string
  description: string
  delay?: number
  href?: string
  badge?: string | undefined
  badgeVariant?: "default" | "secondary" | "outline" | "destructive"
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconName, title, description, delay = 0, href, badge, badgeVariant = "default" }) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group"
      onClick={handleClick}
    >
      <Card className={`h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 ${href ? 'cursor-pointer' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
              <MaterialIcon iconName={iconName} size={24} className="text-white" />
            </div>
            {badge && (
              <Badge variant={badgeVariant} className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
          {href && (
            <div className="mt-4 flex items-center text-primary text-sm font-medium">
              Learn more <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface AnimatedKeyResourcesProps {
  keyResources: Array<{
    icon: string
    title: string
    description: string
    url: string
    category?: string | null
  }>
}

export function AnimatedKeyResources({ keyResources }: AnimatedKeyResourcesProps) {
  return (
    <section className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Resources</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Jump into the UDO and the resources to help you understand it
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {keyResources?.map((resource, index) => {
            // Ensure URL starts with / for internal links
            const href = resource.url && !resource.url.startsWith('http') && !resource.url.startsWith('/') 
              ? `/${resource.url}` 
              : resource.url || '#'
            
            return (
              <FeatureCard
                key={`${resource.title}-${index}`}
                iconName={resource.icon}
                title={resource.title}
                description={resource.description}
                delay={index * 0.1}
                href={href}
                badge={resource.category && resource.category !== 'null' ? resource.category : undefined}
                badgeVariant={resource.category === 'Learn' ? 'default' : resource.category === 'Archive' ? 'outline' : resource.category === 'Ongoing' ? 'secondary' : 'default'}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
