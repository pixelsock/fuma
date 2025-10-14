"use client";

import React, { useState } from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { 
  Users,
  Calendar,
  Video,
  MapPin,
  Building,
  Briefcase,
  Home,
  Trees,
  Car,
  Mail,
  ExternalLink,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// UAC Member data structure
interface UACMember {
  name: string;
  title: string;
  organization?: string;
  category: string;
  image?: string;
}

const uacMembers: UACMember[] = [
  // Neighborhood Representatives
  {
    name: "Angela Ambroise",
    title: "Urban Roots Real Estate Advisors",
    category: "Neighborhood Equity and Stabilization",
  },
  {
    name: "Brenda Campbell",
    title: "Westside Network",
    category: "Neighborhood",
  },
  {
    name: "Padra Campbell",
    title: "Charlotte Regional Transportation Coalition (FCAC)",
    category: "Transportation",
  },
  {
    name: "Nate Doolittle",
    title: "Live/Design",
    category: "Design",
  },
  {
    name: "John Poidevant",
    title: "Former Planning Commissioner",
    organization: "Retired Architect",
    category: "Architecture",
  },
  {
    name: "Drew Gaertner",
    title: "University City Partners",
    category: "Planning",
  },
  {
    name: "Shanique Haynes",
    title: "Greater Elderly Park Neighborhood Association",
    category: "Neighborhood",
  },
  {
    name: "Matt Langston",
    title: "PLA, FASLA Landworks Design Group, PA",
    category: "Landscape Design",
  },
  {
    name: "Tony Lathrop",
    title: "NCDOT",
    category: "Transportation",
  },
  {
    name: "Mark Loflin",
    title: "Former Planning Commissioner",
    organization: "Keep Charlotte Beautiful",
    category: "Planning",
  },
  // Development Representatives
  {
    name: "Roger Morley",
    title: "BBA-M Architecture",
    category: "Architecture",
  },
  {
    name: "Joseph Margolis",
    title: "Denia Community",
    category: "Development",
  },
  {
    name: "Jon L. Morris",
    title: "Beacon Partners",
    category: "Development",
  },
  {
    name: "Cheryl Myers",
    title: "Charlotte Center City Partners",
    category: "Urban Development",
  },
  {
    name: "Julie Porter",
    title: "Greenway Partners",
    category: "Environmental",
  },
  {
    name: "Adam Rhew",
    title: "SouthPark Community Partners",
    category: "Community Development",
  },
  {
    name: "Dennis Rorie",
    title: "Montage Homes",
    category: "Housing",
  },
  {
    name: "Shad Spencer",
    title: "Moore & VanAllen",
    organization: "Former Zoning Administrator",
    category: "Legal/Planning",
  },
  {
    name: "Michael Sullivan",
    title: "The Nichols Company",
    category: "Development",
  },
  {
    name: "Andrea Ufer",
    title: "Steele Creek Residents Association",
    organization: "Former planning professional",
    category: "Planning",
  },
  {
    name: "Eric Zaverl",
    title: "Sustain Charlotte",
    category: "Sustainability",
  },
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'neighborhood':
    case 'neighborhood equity and stabilization':
      return <Home className="h-4 w-4" />;
    case 'transportation':
      return <Car className="h-4 w-4" />;
    case 'design':
    case 'landscape design':
    case 'architecture':
      return <Building className="h-4 w-4" />;
    case 'development':
    case 'urban development':
    case 'community development':
    case 'housing':
      return <Briefcase className="h-4 w-4" />;
    case 'planning':
    case 'legal/planning':
      return <MapPin className="h-4 w-4" />;
    case 'environmental':
    case 'sustainability':
      return <Trees className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'neighborhood':
    case 'neighborhood equity and stabilization':
      return 'bg-blue-600';
    case 'transportation':
      return 'bg-purple-600';
    case 'design':
    case 'landscape design':
    case 'architecture':
      return 'bg-pink-600';
    case 'development':
    case 'urban development':
    case 'community development':
    case 'housing':
      return 'bg-orange-600';
    case 'planning':
    case 'legal/planning':
      return 'bg-green-600';
    case 'environmental':
    case 'sustainability':
      return 'bg-teal-600';
    default:
      return 'bg-gray-600';
  }
};

export default function AdvisoryCommitteePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(uacMembers.map(member => member.category)))];
  
  const filteredMembers = selectedCategory === "all" 
    ? uacMembers 
    : uacMembers.filter(member => member.category === selectedCategory);

  // Group members by category for display
  const groupedMembers = filteredMembers.reduce((acc, member) => {
    if (!acc[member.category]) {
      acc[member.category] = [];
    }
    acc[member.category].push(member);
    return acc;
  }, {} as Record<string, UACMember[]>);

  return (
    <DocsPage>
      <DocsBody className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Unified Development Ordinance Advisory Committee (UAC)
          </h1>
          <p className="text-muted-foreground">
            The UAC meets on an as-needed basis in advance of text amendment petitions being filed.
            The committee, with a wide range of expertise, reviews potential amendments to the UDO as we learn more through
            implementation and want to consider any changes.
          </p>
        </div>

        {/* Meeting Information */}
        <Alert className="mb-8">
          <Clock className="h-4 w-4" />
          <AlertTitle>Meeting Schedule</AlertTitle>
          <AlertDescription className="mt-2">
            The UAC will meet on <strong>Thursdays from 11:30 a.m. – 1 p.m. via Zoom</strong> approximately once a month. 
            Recordings of each meeting will be available within 5-7 business days.
          </AlertDescription>
        </Alert>

        {/* Latest Meeting Video */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Watch the Latest UAC Meeting
            </CardTitle>
            <CardDescription>
              UDO Advisory Committee (UAC Meeting) - February 27, 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Video player placeholder</p>
                <Button variant="outline" asChild>
                  <a href="https://www.youtube.com/watch?v=XXXXXX" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on YouTube
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>View the February 27, 2025 UAC presentation slides HERE.</span>
              <Button variant="link" size="sm" asChild>
                <a href="/downloads/uac-presentation.pdf">
                  Download Slides
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* UAC Membership Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              UAC Membership
            </CardTitle>
            <CardDescription>
              The UAC is made up of representatives from neighborhood, advocacy, development, and design groups. UAC members include:
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === "all" ? "All Members" : category}
                    {category !== "all" && (
                      <span className="ml-2 text-xs">
                        ({uacMembers.filter(m => m.category === category).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Members Grid */}
            <div className="space-y-8">
              {Object.entries(groupedMembers).map(([category, members]) => (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category)} text-white`}>
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <Badge variant="secondary">{members.length} members</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member, index) => (
                      <div 
                        key={`${member.name}-${index}`}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{member.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{member.title}</p>
                            {member.organization && (
                              <p className="text-xs text-muted-foreground italic mt-1">
                                {member.organization}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 justify-start" asChild>
                <a href="mailto:uac@charlottenc.gov">
                  <Mail className="h-4 w-4 mr-2" />
                  Email UAC Committee
                </a>
              </Button>
              <Button variant="outline" className="flex-1 justify-start" asChild>
                <a href="/articles-listing">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse UDO Articles
                </a>
              </Button>
              <Button variant="outline" className="flex-1 justify-start" asChild>
                <a href="https://charlotteudo.org" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Legacy Site
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DocsBody>
    </DocsPage>
  );
}