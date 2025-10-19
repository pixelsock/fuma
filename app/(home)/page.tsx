import React from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { AnimatedKeyResources } from '@/components/animated-key-resources'
import { AnimatedUpdates } from '@/components/animated-updates'
import { AnimatedFAQs } from '@/components/animated-faqs'
import { MaterialIcon } from '@/components/material-icon'
import { directus } from '@/lib/directus-client'
import { readItem } from '@directus/sdk'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

// Types for homepage data
interface HomepageData {
  id: number;
  header_text: string;
  header_description: string;
  header_buttons: Array<{
    button_text: string;
    link: string;
    icon: string;
  }>;
  key_resources: Array<{
    icon: string;
    title: string;
    description: string;
    url: string;
    category?: string | null;
  }>;
  updates: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}


// Server-side data fetching function
async function getHomepageData(): Promise<HomepageData> {
  try {
    const homepage = await directus.request(
      readItem('home_page', 1, {
        fields: ['*']
      })
    )

    return homepage as HomepageData
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    throw error
  }
}

export default async function HomePage() {
  const homepageData = await getHomepageData()

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent-foreground/20" />
        
        <div className="container mx-auto px-4 z-9 text-center">
            <Badge variant="outline" className="mb-6 border-primary text-primary">
              <Calendar className="mr-1 w-3 h-3" />
              Effective June 1, 2023
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            {homepageData.header_text}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            {homepageData.header_description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {homepageData.header_buttons?.map((button, index) => (
              <Button 
                key={index}
                size="lg" 
                className={index === 0 ? "bg-primary hover:bg-primary/90 text-white shadow-xl hover:shadow-2xl transition-all" : "border-primary text-primary hover:bg-primary hover:text-white shadow-xl hover:shadow-2xl transition-all"}
                variant={index === 0 ? "default" : "outline"}
                asChild
              >
                {button.link.startsWith('http') ? (
                  <a href={button.link} target="_blank" rel="noopener noreferrer">
                    <MaterialIcon iconName={button.icon} size={16} />
                    <span className="ml-2">{button.button_text}</span>
                  </a>
                ) : (
                  <Link href={button.link}>
                    <MaterialIcon iconName={button.icon} size={16} />
                    <span className="ml-2">{button.button_text}</span>
                </Link>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Resources Section */}
      <AnimatedKeyResources 
        keyResources={homepageData.key_resources}
      />

      {/* Recent Updates Section */}
      <AnimatedUpdates 
        updates={homepageData.updates}
      />

      {/* FAQ Section */}
      <AnimatedFAQs 
        faqs={homepageData.faqs}
      />

      {/* Newsletter Section */}
      <NewsletterSignup />
    </div>
  )
}