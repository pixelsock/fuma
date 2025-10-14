'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar,
  ArrowRight,
  FileText,
  Clock,
  Users,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  Play,
  Mail,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Amendment {
  id: string
  name: string
  description: string
  status: 'approved' | 'pending' | 'review'
  date: string
  petition?: string
  ordinance?: string
  caseNumber: string
}

interface TimelineItemProps {
  date: string
  title: string
  description: string
  status: 'approved' | 'pending' | 'info'
  isLast?: boolean
  index: number
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description, status, isLast, index }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  const statusConfig = {
    approved: { color: 'from-green-500 to-green-600', icon: CheckCircle, badge: 'Approved' },
    pending: { color: 'from-yellow-500 to-yellow-600', icon: AlertCircle, badge: 'Pending' },
    info: { color: 'from-blue-500 to-blue-600', icon: Info, badge: 'Information' }
  }

  const config = statusConfig[status]

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
          <Badge variant={status === 'approved' ? 'default' : status === 'pending' ? 'secondary' : 'outline'}>
            {config.badge}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}

export default function TextAmendmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const amendments: Amendment[] = [
    {
      id: '2024-001',
      name: 'Unified Development Ordinance',
      description: 'General amendments to various sections',
      status: 'approved',
      date: '07-19-2022',
      ordinance: '07-19-2022',
      caseNumber: '06-01-2024'
    },
    {
      id: '2023-008',
      name: 'Land Clearing and Inert Debris Landfill',
      description: 'Use adjustments for C2 & C3 Zoning in Catawba Place Types',
      status: 'approved',
      date: '04-17-2023',
      petition: '2023-008',
      ordinance: '05-02-2023',
      caseNumber: '05-15-2023'
    },
    {
      id: '2023-007',
      name: 'Multi-Family Residential for C2 & C3 Zoning',
      description: 'Amendments for residential development standards',
      status: 'approved',
      date: '04-17-2023',
      ordinance: '05-02-2023',
      caseNumber: 'N/A'
    },
    {
      id: '2023-006',
      name: 'UDO General Clean Up Text Amendment',
      description: 'Various technical corrections and clarifications',
      status: 'approved',
      date: '04-17-2023',
      ordinance: '05-02-2023',
      caseNumber: '05-15-2023'
    }
  ]

  const timelineItems = [
    {
      date: 'July 15, 2025',
      title: 'Suggestions for UDO Updates',
      description: 'Charlotte Planning, Design and Development would like to share an opportunity to suggest updates or recommend changes to the City\'s Unified Development Ordinance (UDO) through an online portal.',
      status: 'info' as const
    },
    {
      date: 'June 20, 2025',
      title: 'Spring 2025 UDO Maintenance Text Amendment',
      description: 'City Council approved text amendment petition #2025-047 on June 16. This petition was a maintenance text amendment to the Unified Development Ordinance (UDO) and it proposed changes to 26 of the 39 UDO Articles.',
      status: 'approved' as const
    },
    {
      date: 'Current',
      title: 'Submit a Suggestion',
      description: 'Click the button below or click here to submit a suggested update or recommended change.',
      status: 'pending' as const
    }
  ]

  const filteredAmendments = amendments.filter(amendment => {
    const matchesSearch = amendment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || amendment.status === statusFilter
    return matchesSearch && matchesStatus
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
        
        <div className="container mx-auto px-4 z-9 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 border-primary text-primary">
              <FileText className="mr-1 w-3 h-3" />
              Living Document
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              UDO Text Amendments
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              In keeping with the intention of maintaining the UDO as a "living" document, it will continue to be updated and modified through text amendments, even after its adoption.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all">
                Submit a Suggestion
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-white shadow-xl hover:shadow-2xl transition-all">
                <Download className="mr-2 w-4 h-4" />
                View UDO Versions
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Updates Timeline */}
      <section className="py-20 bg-background/50">
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
            {timelineItems.map((item, index) => (
              <TimelineItem
                key={index}
                date={item.date}
                title={item.title}
                description={item.description}
                status={item.status}
                isLast={index === timelineItems.length - 1}
                index={index}
              />
            ))}
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
              <a href="mailto:charlotteUDO@charlottenc.gov" className="text-primary hover:underline">
                charlotteUDO@charlottenc.gov
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Text Amendment History */}
      <section className="py-20 bg-muted/30">
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
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search amendments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Petition</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Ordinance</TableHead>
                        <TableHead>Case #</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAmendments.map((amendment, index) => (
                        <motion.tr
                          key={amendment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {amendment.petition || 'N/A'}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div>
                              <p className="font-medium">{amendment.name}</p>
                              <p className="text-sm text-muted-foreground">{amendment.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={amendment.status === 'approved' ? 'default' : 'secondary'}>
                              {amendment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{amendment.date}</TableCell>
                          <TableCell>{amendment.ordinance || 'N/A'}</TableCell>
                          <TableCell>{amendment.caseNumber}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" className="h-8 px-2">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Informational Sessions */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">UDO Text Amendment Informational Sessions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch recorded sessions to learn more about the text amendment process
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white">
                      <Play className="w-6 h-6" />
                    </div>
                    <Badge variant="outline">Virtual Session</Badge>
                  </div>
                  <CardTitle>Spring 2025 UDO Maintenance Text Amendment</CardTitle>
                  <CardDescription>
                    Virtual information session covering the latest maintenance amendments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>April 15, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Duration: 1 hour 30 minutes</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Play className="mr-2 w-4 h-4" />
                      Watch Recording
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Have Questions or Suggestions?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              We're here to help! Contact our team for information about text amendments or submit your suggestions for improving the UDO.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Mail className="mr-2 w-4 h-4" />
                Email Our Team
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
              >
                Submit a Suggestion
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}