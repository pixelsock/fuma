"use client";

import React from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import {
  Users,
  Video,
  Mail,
  ExternalLink,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// UAC Member data structure
interface UACMember {
  name: string;
  organization: string;
  additionalDetails?: string;
  image?: string;
}

const uacMembers: UACMember[] = [
  {
    name: "Angela Ambroise",
    organization: "Urban Roots Real Estate Advisors",
  },
  {
    name: "Brenda Campbell",
    organization: "Westside Network",
  },
  {
    name: "Padra Campbell",
    organization: "Charlotte Regional Transportation Coalition (FCAC)",
  },
  {
    name: "Nate Doolittle",
    organization: "Live/Design",
  },
  {
    name: "John Poidevant",
    organization: "Former Planning Commissioner",
    additionalDetails: "Retired Architect",
  },
  {
    name: "Drew Gaertner",
    organization: "University City Partners",
  },
  {
    name: "Shanique Haynes",
    organization: "Greater Elderly Park Neighborhood Association",
  },
  {
    name: "Matt Langston",
    organization: "PLA, FASLA Landworks Design Group, PA",
  },
  {
    name: "Tony Lathrop",
    organization: "NCDOT",
  },
  {
    name: "Mark Loflin",
    organization: "Former Planning Commissioner",
    additionalDetails: "Keep Charlotte Beautiful",
  },
  {
    name: "Roger Morley",
    organization: "BBA-M Architecture",
  },
  {
    name: "Joseph Margolis",
    organization: "Denia Community",
  },
  {
    name: "Jon L. Morris",
    organization: "Beacon Partners",
  },
  {
    name: "Cheryl Myers",
    organization: "Charlotte Center City Partners",
  },
  {
    name: "Julie Porter",
    organization: "Greenway Partners",
  },
  {
    name: "Adam Rhew",
    organization: "SouthPark Community Partners",
  },
  {
    name: "Dennis Rorie",
    organization: "Montage Homes",
  },
  {
    name: "Shad Spencer",
    organization: "Moore & VanAllen",
    additionalDetails: "Former Zoning Administrator",
  },
  {
    name: "Michael Sullivan",
    organization: "The Nichols Company",
  },
  {
    name: "Andrea Ufer",
    organization: "Steele Creek Residents Association",
    additionalDetails: "Former planning professional",
  },
  {
    name: "Eric Zaverl",
    organization: "Sustain Charlotte",
  },
];

export default function AdvisoryCommitteePage() {
  return (
    <DocsPage>
      <DocsBody className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Unified Development Ordinance Advisory Committee (UAC)
          </h1>
          <p className="text-muted-foreground">
            The Unified Development Ordinance Advisory Committee (UAC) is a volunteer committee of neighborhoods, environmental groups, designers, and 
            development professionals. The committee, with a wide range of expertise, reviews potential amendments to the UDO as we learn more through 
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uacMembers.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{member.organization}</p>
                        {member.additionalDetails && (
                          <p className="text-sm text-muted-foreground">{member.additionalDetails}</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
