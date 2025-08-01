"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Users, 
  Award, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight,
  Mail,
  CheckCircle,
  Calendar,
  Target,
  Rocket,
  Building,
  BookOpen,
  FileText,
  GraduationCap,
  MapPin,
  Home,
  FileSearch,
  Map,
  School,
  Clock,
  AlertCircle,
  ExternalLink,
  Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

interface CounterProps {
  end: number
  duration?: number
  suffix?: string
}

const Counter: React.FC<CounterProps> = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [inView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
  href?: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline" | "destructive"
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0, href, badge, badgeVariant = "default" }) => {
  const router = useRouter()
  
  const handleClick = () => {
    if (href) {
      router.push(href)
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
              {icon}
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

interface TimelineItemProps {
  date: string
  title: string
  description: string
  isLast?: boolean
  index: number
  icon?: React.ReactNode
}

const TimelineItem: React.FC<TimelineItemProps> = ({ date, title, description, isLast, index, icon }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} mb-8`}
    >
      <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
        <Card className="bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {icon && <div className="text-primary">{icon}</div>}
              <Badge variant="outline" className="w-fit border-primary text-primary">
                {date}
              </Badge>
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{description}</CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-2/12 flex justify-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
            className="w-4 h-4 bg-gradient-to-r from-primary to-accent-foreground rounded-full border-4 border-background z-10 relative"
          />
          {!isLast && (
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: "100px" } : { height: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
              className="w-0.5 bg-gradient-to-b from-primary to-accent-foreground absolute top-4 left-1/2 transform -translate-x-1/2"
            />
          )}
        </div>
      </div>
      
      <div className="w-5/12" />
    </motion.div>
  )
}

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const router = useRouter()

  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "What is the UDO?",
      description: "Learn about Charlotte's Unified Development Ordinance and how it shapes our city's growth.",
      href: "/what-is-udo",
      badge: "Learn",
      badgeVariant: "default" as const
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Transitioning to the UDO",
      description: "We have changed over to the UDO. Find all the information you need on this transition here.",
      href: "/articles/transitioning-to-udo",
      badge: "Active",
      badgeVariant: "secondary" as const
    },
    {
      icon: <Archive className="w-6 h-6" />,
      title: "UDO Versions",
      description: "Access current and historical versions of the Charlotte Unified Development Ordinance.",
      href: "/versions",
      badge: "Archive",
      badgeVariant: "outline" as const
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Text Amendments",
      description: "The UDO is a living document that continues to be updated through text amendments.",
      href: "/text-amendments",
      badge: "Ongoing",
      badgeVariant: "secondary" as const
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "UDO University",
      description: "Virtual training opportunities and resources to learn about the UDO.",
      href: "/articles/udo-university",
      badge: "Educational",
      badgeVariant: "outline" as const
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Zoning Map",
      description: "Interactive zoning map to check property zoning and regulations.",
      href: "/articles/zoning-map",
      badge: "Interactive"
    },
    {
      icon: <FileSearch className="w-6 h-6" />,
      title: "Search Articles",
      description: "Find specific ordinances, regulations, and guidelines quickly.",
      href: "/articles-listing",
      badge: "Quick Access"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Has My Zoning Changed?",
      description: "Check if your property's zoning designation has changed with the UDO.",
      href: "/articles/zoning-changes",
      badge: "Important"
    }
  ]

  const stats = [
    { label: "Articles", value: 250, suffix: "+" },
    { label: "Zoning Districts", value: 42, suffix: "" },
    { label: "Years in Development", value: 5, suffix: "" },
    { label: "Community Input Sessions", value: 100, suffix: "+" }
  ]

  const timeline = [
    {
      date: "2019",
      title: "UDO Development Begins",
      description: "Charlotte City Council initiated the comprehensive update to the zoning ordinance.",
      icon: <Rocket className="w-5 h-5" />
    },
    {
      date: "2020-2021",
      title: "Community Engagement",
      description: "Extensive public input gathered through workshops, surveys, and community meetings.",
      icon: <Users className="w-5 h-5" />
    },
    {
      date: "2022",
      title: "Draft UDO Released",
      description: "First complete draft released for public review and feedback.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      date: "April 2023",
      title: "UDO Adopted",
      description: "Charlotte City Council formally adopted the Unified Development Ordinance.",
      icon: <Award className="w-5 h-5" />
    },
    {
      date: "June 1, 2023",
      title: "UDO Becomes Effective",
      description: "The new ordinance officially went into effect, replacing the previous zoning code.",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      date: "2024 & Beyond",
      title: "Continuous Improvement",
      description: "Ongoing text amendments and updates based on implementation experience.",
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const faqs = [
    {
      question: "What is the Charlotte UDO?",
      answer: "The Charlotte Unified Development Ordinance (UDO) is a comprehensive update to the city's zoning regulations. It combines and modernizes previous ordinances into a single, user-friendly document that guides development in Charlotte."
    },
    {
      question: "When did the UDO become effective?",
      answer: "The UDO became effective on June 1, 2023, replacing the previous zoning ordinance. All development applications submitted after this date must comply with the new regulations."
    },
    {
      question: "Has my property's zoning changed?",
      answer: "Many properties received new zoning designations under the UDO. You can check your property's zoning using our interactive zoning map or by contacting the Planning Department."
    },
    {
      question: "How can I learn more about the UDO?",
      answer: "UDO University offers virtual training sessions and resources. You can also browse our comprehensive article library, attend public workshops, or contact our planning staff for assistance."
    },
    {
      question: "How are text amendments processed?",
      answer: "Text amendments follow a public process including staff review, community input, Planning Commission recommendation, and City Council approval. Check our Text Amendments page for current proposals."
    }
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      // Here you would typically send the email to your backend
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail("")
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Hero Section - Extended to top */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16">
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
              <Calendar className="mr-1 w-3 h-3" />
              Effective June 1, 2023
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Charlotte Unified Development Ordinance
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Your comprehensive guide to development regulations, zoning districts, and land use in Charlotte.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/articles-listing">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Browse Articles
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-white shadow-xl hover:shadow-2xl transition-all" asChild>
                <Link href="/articles/zoning-map">
                  <MapPin className="mr-2 w-4 h-4" />
                  View Zoning Map
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* Key Resources Section */}
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
              Everything you need to understand and navigate the Charlotte UDO
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
                href={feature.href}
                badge={feature.badge}
                badgeVariant={feature.badgeVariant}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent-foreground/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">UDO by the Numbers</h2>
            <p className="text-xl text-muted-foreground">A comprehensive update years in the making</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent mb-2">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">UDO Development Timeline</h2>
            <p className="text-xl text-muted-foreground">The journey to Charlotte's unified ordinance</p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto">
            {timeline.map((item, index) => (
              <TimelineItem
                key={index}
                date={item.date}
                title={item.title}
                description={item.description}
                isLast={index === timeline.length - 1}
                index={index}
                icon={item.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Access</h2>
            <p className="text-xl text-muted-foreground">Popular sections and tools</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Home, label: "Neighborhood Districts", href: "/articles/neighborhood-districts" },
              { icon: Building, label: "Commercial Districts", href: "/articles/commercial-districts" },
              { icon: Map, label: "Overlay Districts", href: "/articles/overlay-districts" },
              { icon: FileSearch, label: "Use Regulations", href: "/articles/use-regulations" },
              { icon: School, label: "Development Standards", href: "/articles/development-standards" },
              { icon: Shield, label: "Environmental", href: "/articles/environmental" },
              { icon: Clock, label: "Procedures", href: "/articles/procedures" },
              { icon: ExternalLink, label: "External Resources", href: "/articles/resources" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Link href={item.href}>
                  <Card className="text-center hover:shadow-lg transition-all duration-200 hover:border-primary/30 cursor-pointer group">
                    <CardContent className="p-6">
                      <item.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {item.label}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Common questions about the Charlotte UDO</p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AccordionItem value={`item-${index}`} className="border border-border/50 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe for UDO updates, text amendments, and important announcements
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-white/90"
                >
                  Thank you for subscribing! We'll keep you updated on UDO changes.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
