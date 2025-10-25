import React from 'react';
import Link from 'next/link';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { 
  BookOpen,
  Play
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface KeyFeature {
  icon: string;
  title: string;
  description: string;
}

interface LearnMoreLink {
  icon: string;
  title: string;
  description: string;
  url: string;
}

interface QuickFact {
  value: string;
  label: string;
}

interface WhatIsUDOPageData {
  page_title: string;
  page_description: string;
  video_url: string;
  video_title: string;
  video_description: string;
  alert_title: string;
  alert_content: string;
  key_features: KeyFeature[];
  learn_more_links: LearnMoreLink[];
  quick_facts: QuickFact[];
}

function getIconComponent(iconName: string) {
  const Icon = (LucideIcons as any)[iconName.split('-').map((word: string) => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('').replace(/_/g, '')];
  return Icon || LucideIcons.HelpCircle;
}

async function getPageData(): Promise<WhatIsUDOPageData> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const res = await fetch(`${baseUrl}/api/what-is-udo-page`, {
    next: { revalidate: 60 }
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch page data');
  }
  
  return res.json();
}


export default async function WhatIsUDOPage() {
  const data = await getPageData();
  
  return (
    <DocsPage>
      <DocsBody className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {data.page_title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {data.page_description}
          </p>
        </div>

        {/* Video Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              {data.video_title}
            </CardTitle>
            <CardDescription className="mb-4">
              {data.video_description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src={data.video_url}
                title={data.video_title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Points Alert */}
        <Alert className="mb-12 border-primary">
          <BookOpen className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <strong className="block mb-2">{data.alert_title}</strong>
            {data.alert_content}
          </AlertDescription>
        </Alert>

        {/* Key Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Key Features of the UDO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {data.key_features.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <div key={index} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg" style={{ margin: 0, padding: 0 }}>{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>


        {/* Learn More Section - Styled like Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Learn More</h2>
          <p className="text-muted-foreground mb-8">
            Explore these resources to better understand the UDO
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {data.learn_more_links.map((link, index) => {
              const IconComponent = getIconComponent(link.icon);
              return (
                <Link key={index} href={link.url} style={{ textDecoration: 'none' }} className="h-full">
                  <Card className="h-full hover:shadow-lg transition-shadow group cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Facts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.quick_facts.map((fact, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{fact.value}</div>
              <p className="text-sm text-muted-foreground">{fact.label}</p>
            </div>
          ))}
        </div>
      </DocsBody>
    </DocsPage>
  );
}