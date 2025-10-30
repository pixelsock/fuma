'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar,
  ArrowRight,
  Clock,
  Users,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LatestUpdate } from '@/lib/directus-source'
import { KiboTextAmendmentsTableV3 } from '@/components/kibo-text-amendments-table-v3'
import { InformationalSessions } from '@/components/informational-sessions'
import { DocsPage, DocsBody } from 'fumadocs-ui/page'


interface TimelineItemProps {
  date: string
  title: string
  description: string
  category: 'information' | 'approved' | 'pending'
  isLast?: boolean
  index: number
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description, category, isLast, index }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const statusConfig = {
    approved: { color: 'from-green-500 to-green-600', icon: CheckCircle, badge: 'Approved' },
    pending: { color: 'from-yellow-500 to-yellow-600', icon: AlertCircle, badge: 'Pending' },
    information: { color: 'from-blue-500 to-blue-600', icon: Info, badge: 'Information' }
  }

  const config = statusConfig[category]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="flex gap-8 pb-12"
    >
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
          className={`w-12 h-12 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center text-white shadow-lg`}
        >
          <config.icon className="w-6 h-6" />
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
            className="w-0.5 bg-gradient-to-b from-border to-transparent flex-1 mt-4"
          />
        )}
      </div>
      
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            {date}
          </Badge>
          <Badge variant={category === 'approved' ? 'default' : category === 'pending' ? 'secondary' : 'outline'}>
            {config.badge}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </motion.div>
  )
}

export default function TextAmendmentsPage() {
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdate[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch latest updates from API
  useEffect(() => {
    async function fetchUpdates() {
      try {
        setLoading(true)
        const response = await fetch('/api/latest-updates')
        if (!response.ok) {
          throw new Error('Failed to fetch updates')
        }
        const updates = await response.json()
        setLatestUpdates(updates)
      } catch (error) {
        console.error('Error fetching latest updates:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUpdates()
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  return (
    <DocsPage>
      <DocsBody className="max-w-content mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            UDO Text Amendments
          </h1>
          <p className="text-muted-foreground mb-8">
            In keeping with the intention of maintaining the UDO as a "living" document, it will continue to be updated and modified through text amendments, even after its adoption.
          </p>
            
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" asChild>
              <a 
                href="https://publicinput.com/udo-comment-hub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="no-underline"
                style={{ textDecoration: 'none' }}
              >
                Submit a Suggestion
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              <Download className="mr-2 w-4 h-4" />
              View UDO Versions
            </Button>
          </div>
        </div>

      {/* Latest Updates Timeline */}
      <section className="pt-8 pb-20 bg-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Updates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed about the most recent text amendments and updates to the UDO
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading latest updates...</p>
              </div>
            ) : latestUpdates.length > 0 ? (
              latestUpdates.map((update, index) => (
                <TimelineItem
                  key={update.id}
                  date={formatDate(update.date)}
                  title={update.title}
                  description={update.description}
                  category={update.category}
                  isLast={index === latestUpdates.length - 1}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No updates available at this time.</p>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Questions? Email our team at{' '}
              <a href="mailto:charlotteudo@charlottenc.gov" className="text-primary hover:underline">
                charlotteudo@charlottenc.gov
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Text Amendment History */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Text Amendment History</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse the complete history of UDO text amendments
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <KiboTextAmendmentsTableV3 />
          </motion.div>
        </div>
      </section>

      {/* Informational Sessions */}
      <InformationalSessions />
      </DocsBody>
    </DocsPage>
  )
}