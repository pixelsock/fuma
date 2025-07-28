"use client";

import React from 'react';
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
  CheckCircle,
  ExternalLink,
  FileText,
  Eye,
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

const benefits = [
  "Easier to navigate and understand than the previous ordinance",
  "Supports the community's vision for growth and development",
  "Promotes walkable, mixed-use neighborhoods",
  "Protects natural resources and tree canopy",
  "Encourages a variety of housing types and affordability",
  "Streamlines the development review process"
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
            regulations that guides how land is used and developed throughout Charlotte. Adopted on April 11, 2022, 
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

        <Separator className="my-12" />

        {/* What's Different Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What's Different About the UDO?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Place-Based Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Unlike traditional zoning that focuses primarily on land use, the UDO uses a place-based 
                  approach that considers:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Building form and design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Street and sidewalk relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Transitions between different areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Community character and context</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community-Driven
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  The UDO was developed through extensive community engagement including:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>100+ community meetings and workshops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Thousands of public comments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Advisory committees and working groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Online surveys and interactive mapping</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Benefits of the UDO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Learn More
            </CardTitle>
            <CardDescription>
              Explore these resources to better understand the UDO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/articles-listing">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse UDO Articles
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/articles/transitioning-to-udo">
                  <Building className="h-4 w-4 mr-2" />
                  Transitioning to the UDO
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/articles/udo-university">
                  <Users className="h-4 w-4 mr-2" />
                  UDO University
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/articles/zoning-map">
                  <Map className="h-4 w-4 mr-2" />
                  Interactive Zoning Map
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/versions">
                  <Download className="h-4 w-4 mr-2" />
                  Download UDO
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/advisory-committee">
                  <Users className="h-4 w-4 mr-2" />
                  Advisory Committee
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

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