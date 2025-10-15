"use client";

import React from 'react';
import Link from 'next/link';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { 
  BookOpen,
  Building,
  Trees,
  Car,
  Home,
  Map,
  Shield,
  Users,
  FileText,
  Download,
  Play
} from 'lucide-react';
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
  icon: React.ReactNode;
  title: string;
  description: string;
}

const keyFeatures: KeyFeature[] = [
  {
    icon: <Map className="h-6 w-6" />,
    title: "Place Types",
    description: "A new approach to zoning that focuses on the character and form of development rather than just land use."
  },
  {
    icon: <Building className="h-6 w-6" />,
    title: "Unified Standards",
    description: "Combines zoning, subdivision, streets, and other development standards into one comprehensive document."
  },
  {
    icon: <Trees className="h-6 w-6" />,
    title: "Environmental Protection",
    description: "Enhanced tree protection, stormwater management, and environmental standards."
  },
  {
    icon: <Car className="h-6 w-6" />,
    title: "Transit-Oriented Development",
    description: "Encourages development near transit stations and along transit corridors."
  },
  {
    icon: <Home className="h-6 w-6" />,
    title: "Neighborhood Protection",
    description: "Protects the character of established neighborhoods while allowing appropriate infill development."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Predictable Process",
    description: "Clear and predictable development review process with defined timelines and expectations."
  }
];


export default function WhatIsUDOPage() {
  return (
    <DocsPage>
      <DocsBody className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            What is the Charlotte UDO?
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The Charlotte Unified Development Ordinance (UDO) is a comprehensive update to the city's development 
            regulations that guides how land is used and developed throughout Charlotte. Adopted on August 22, 2022, 
            and effective June 1, 2023, the UDO replaces the previous zoning ordinance with modern, place-based 
            regulations that support the community's vision for growth.
          </p>
        </div>

        {/* Video Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Learn About the UDO
            </CardTitle>
            <CardDescription>
              Watch this introductory video to understand the basics of Charlotte's Unified Development Ordinance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/FQ5TDuiSnZo"
                title="What is the Charlotte UDO?"
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
            <strong className="block mb-2">Why a Unified Development Ordinance?</strong>
            The UDO consolidates multiple ordinances into a single, user-friendly document that aligns development 
            regulations with Charlotte's adopted plans and policies, including the Charlotte Future 2040 Comprehensive Plan.
          </AlertDescription>
        </Alert>

        {/* Key Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Features of the UDO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Learn More Section - Styled like Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Learn More</h2>
          <p className="text-muted-foreground mb-8">
            Explore these resources to better understand the UDO
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/articles-listing">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Browse UDO Articles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Search and explore all UDO articles by category
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/articles/udo-university">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Users className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">UDO University</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Virtual training opportunities and educational resources
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/articles/zoning-map">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Map className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Interactive Zoning Map</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Check property zoning and regulations interactively
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/versions">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Download className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Download UDO</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access current and historical versions of the UDO
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/text-amendments">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Text Amendments</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track ongoing updates and amendments to the UDO
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/advisory-committee">
              <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Users className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">Advisory Committee</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Learn about UAC membership and meeting information
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">June 1, 2023</div>
            <p className="text-sm text-muted-foreground">Effective Date</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">700+</div>
            <p className="text-sm text-muted-foreground">Pages of Regulations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">42</div>
            <p className="text-sm text-muted-foreground">Zoning Districts</p>
          </div>
        </div>
      </DocsBody>
    </DocsPage>
  );
}