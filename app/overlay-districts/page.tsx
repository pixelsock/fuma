'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home,
  MapPin,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  Info,
  Users,
  Building,
  Shield,
  Layers,
  AlertCircle,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  Calendar,
  Target,
  Zap,
  Award,
  BookOpen,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface OverlayType {
  id: string
  name: string
  abbreviation: string
  description: string
  icon: React.ElementType
  color: string
  funding?: string
  eligibility?: string[]
  benefits?: string[]
}

interface VideoResource {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: string
  category: string
}

const overlayTypes: OverlayType[] = [
  {
    id: 'hdo',
    name: 'Historic District Overlay',
    abbreviation: 'HDO',
    description: 'Preserve the historic character, scale and overall feel of historic neighborhoods',
    icon: Building,
    color: 'from-amber-500 to-amber-600',
    eligibility: [
      'Located in designated historic districts',
      'Contributing structures',
      'Meets age requirements'
    ],
    benefits: [
      'Property tax deferrals',
      'Grant opportunities',
      'Design flexibility for adaptive reuse'
    ]
  },
  {
    id: 'nco',
    name: 'Neighborhood Character Overlay',
    abbreviation: 'NCO',
    description: 'Maintain established neighborhood patterns and development standards',
    icon: Home,
    color: 'from-green-500 to-green-600',
    eligibility: [
      'Established neighborhoods',
      'Consistent development patterns',
      'Community support'
    ],
    benefits: [
      'Protects neighborhood character',
      'Custom development standards',
      'Community input on changes'
    ]
  },
  {
    id: 'rio',
    name: 'Residential Infill Overlay',
    abbreviation: 'RIO',
    description: 'Guide infill development to be compatible with existing neighborhood context',
    icon: Layers,
    color: 'from-blue-500 to-blue-600',
    funding: '$125,000',
    eligibility: [
      'Areas experiencing development pressure',
      'Infill development opportunities',
      'Neighborhood support required'
    ],
    benefits: [
      'Financial assistance available',
      'Protects neighborhood scale',
      'Encourages compatible development'
    ]
  }
]

const videoResources: VideoResource[] = [
  {
    id: '1',
    title: 'UDO Residential Overlay Districts Overview',
    description: 'Introduction to overlay districts and their purpose in the UDO',
    youtubeId: 'IQZLikmmwGk',
    duration: '5:45',
    category: 'overview'
  },
  {
    id: '2',
    title: 'Historic District Overlay (HDO) Explained',
    description: 'Learn about HDO requirements and benefits for property owners',
    youtubeId: 'khLnlkqpINg',
    duration: '8:30',
    category: 'hdo'
  },
  {
    id: '3',
    title: 'Neighborhood Character Overlay (NCO) Guide',
    description: 'Understanding NCO standards and application process',
    youtubeId: 'Vxrrvdjrwo4',
    duration: '6:15',
    category: 'nco'
  },
  {
    id: '4',
    title: 'Residential Infill Overlay (RIO) Program',
    description: 'How to apply for RIO designation and available funding',
    youtubeId: '5dYa_kmdL0g',
    duration: '7:20',
    category: 'rio'
  }
]

const quickComparison = [
  {
    feature: 'Primary Purpose',
    hdo: 'Preserve historic character',
    nco: 'Maintain neighborhood patterns',
    rio: 'Guide compatible infill'
  },
  {
    feature: 'Review Required',
    hdo: 'Yes - Historic District Commission',
    nco: 'Varies by standards',
    rio: 'Standard zoning review'
  },
  {
    feature: 'Financial Incentives',
    hdo: 'Tax deferrals available',
    nco: 'None',
    rio: '$125,000 program funding'
  },
  {
    feature: 'Application Process',
    hdo: 'City-initiated',
    nco: 'Community-initiated',
    rio: 'Property owner application'
  }
]

interface OverlayCardProps {
  overlay: OverlayType
  index: number
  onLearnMore: () => void
}

const OverlayCard: React.FC<OverlayCardProps> = ({ overlay, index, onLearnMore }) => {
  const Icon = overlay.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${overlay.color} flex items-center justify-center text-white shadow-lg`}>
              <Icon className="w-7 h-7" />
            </div>
            <Badge variant="outline" className="text-sm font-bold">
              {overlay.abbreviation}
            </Badge>
          </div>
          <CardTitle className="text-xl">{overlay.name}</CardTitle>
          <CardDescription className="text-base mt-2">
            {overlay.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overlay.funding && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold">{overlay.funding} in funding available</span>
            </div>
          )}
          
          {overlay.benefits && (
            <div>
              <p className="text-sm font-medium mb-2">Key Benefits:</p>
              <ul className="space-y-1">
                {overlay.benefits.slice(0, 2).map((benefit, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            onClick={onLearnMore}
            className="w-full group"
            variant="outline"
          >
            Learn More
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface VideoCardProps {
  video: VideoResource
  index: number
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-primary ml-1" />
            </div>
          </div>
          <Badge variant="secondary" className="absolute top-4 right-4">
            {video.duration}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function OverlayDistrictsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)

  const handleWatchVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - Extended to top */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent-foreground/20" />
        
        {/* Animated Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 border-primary text-primary">
              <Layers className="mr-1 w-3 h-3" />
              Special Zoning Designations
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              UDO Overlay Districts
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Preserve neighborhood character, protect historic resources, and guide compatible development through specialized overlay districts.
            </p>
            
            {/* Alert Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Alert className="border-green-500/50 bg-green-500/10">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertTitle>Residential Overlay Program Open!</AlertTitle>
                <AlertDescription>
                  $125,000 available in funding for eligible properties. Applications now being accepted.
                </AlertDescription>
              </Alert>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all"
                onClick={() => setActiveTab('rio')}
              >
                <DollarSign className="mr-2 w-4 h-4" />
                Apply for Funding
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <Download className="mr-2 w-4 h-4" />
                Comparison Guide
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overlay Types Overview */}
      <section className="py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Types of Overlay Districts</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Charlotte offers three types of overlay districts to address different community needs
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {overlayTypes.map((overlay, index) => (
              <OverlayCard
                key={overlay.id}
                overlay={overlay}
                index={index}
                onLearnMore={() => setActiveTab(overlay.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hdo">HDO</TabsTrigger>
              <TabsTrigger value="nco">NCO</TabsTrigger>
              <TabsTrigger value="rio">RIO</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="overview" className="mt-0">
                  <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">Quick Comparison Guide</CardTitle>
                      <CardDescription>
                        Compare the three overlay district types to understand which might apply to your property
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Feature</TableHead>
                              <TableHead>Historic District (HDO)</TableHead>
                              <TableHead>Neighborhood Character (NCO)</TableHead>
                              <TableHead>Residential Infill (RIO)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quickComparison.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{row.feature}</TableCell>
                                <TableCell>{row.hdo}</TableCell>
                                <TableCell>{row.nco}</TableCell>
                                <TableCell>{row.rio}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download Full Comparison PDF
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Comparison Chart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {overlayTypes.map((overlay) => (
                  <TabsContent key={overlay.id} value={overlay.id} className="mt-0">
                    <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${overlay.color} flex items-center justify-center text-white shadow-lg`}>
                            <overlay.icon className="w-8 h-8" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{overlay.name} ({overlay.abbreviation})</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {overlay.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {overlay.funding && (
                          <Alert className="border-green-500/50 bg-green-500/10">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <AlertTitle>Funding Available</AlertTitle>
                            <AlertDescription>
                              {overlay.funding} in program funding is currently available for eligible properties.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              Eligibility Requirements
                            </h3>
                            <ul className="space-y-2">
                              {overlay.eligibility?.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Award className="w-5 h-5 text-primary" />
                              Benefits & Incentives
                            </h3>
                            <ul className="space-y-2">
                              {overlay.benefits?.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                          {overlay.id === 'rio' && (
                            <Button className="flex-1">
                              <FileText className="mr-2 w-4 h-4" />
                              Start Application
                            </Button>
                          )}
                          <Button variant="outline" className="flex-1">
                            <BookOpen className="mr-2 w-4 h-4" />
                            Read Full Guidelines
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Phone className="mr-2 w-4 h-4" />
                            Contact Staff
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* Video Resources */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Educational Resources</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch these videos to learn more about overlay districts and how they work
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {videoResources.map((video, index) => (
              <div key={video.id} onClick={() => handleWatchVideo(video.youtubeId)}>
                <VideoCard video={video} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Common questions about overlay districts
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border border-border/50 rounded-lg px-6 bg-background/50 backdrop-blur-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>What is an overlay district?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  An overlay district is a zoning tool that preserves the historic character, scale and overall feel of neighborhoods. 
                  It provides additional development standards beyond the base zoning to address specific community needs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border border-border/50 rounded-lg px-6 bg-background/50 backdrop-blur-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>How do I know if my property is in an overlay district?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can check if your property is in an overlay district by using the interactive zoning map on our website, 
                  or by contacting the Planning Department. Properties in overlay districts will have an additional designation 
                  beyond their base zoning.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border border-border/50 rounded-lg px-6 bg-background/50 backdrop-blur-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Can I apply for overlay district designation?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  It depends on the type of overlay. Historic District Overlays are typically city-initiated, 
                  Neighborhood Character Overlays require community support and a formal application process, 
                  and Residential Infill Overlays can be applied for by individual property owners with $125,000 
                  in funding currently available.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border border-border/50 rounded-lg px-6 bg-background/50 backdrop-blur-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>What are the benefits of being in an overlay district?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Benefits vary by overlay type but may include property tax deferrals (HDO), protection of neighborhood 
                  character, access to grant funding, design flexibility for adaptive reuse, and financial assistance 
                  for compatible development. Each overlay provides specific benefits tailored to its purpose.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Additional Resources</h2>
            <p className="text-xl text-muted-foreground">
              Documents and links to help you understand overlay districts
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <FileText className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Comparison Guide</CardTitle>
                  <CardDescription>
                    Detailed comparison of all overlay district types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <MapPin className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>
                    Find overlay districts on the zoning map
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href="/articles/zoning-map">
                      <ExternalLink className="w-4 h-4" />
                      View Map
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <Users className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Contact Planning</CardTitle>
                  <CardDescription>
                    Get help from our planning staff
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Email Staff
                  </Button>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Apply for an Overlay District?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Our planning staff is here to guide you through the process and answer any questions you may have.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                <FileText className="mr-2 w-4 h-4" />
                Start Application
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
              >
                <Calendar className="mr-2 w-4 h-4" />
                Schedule Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}