"use client";

import React from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import {
  Download,
  AlertCircle,
  FileText,
  ExternalLink,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Type for UDO version entries
type UdoVersion = {
  id: number;
  title: string;
  amendedDate: string;
  status: string;
  pdfUrl?: string;
  externalUrl?: string;
};

// Sample data for UDO versions
const udoVersions: UdoVersion[] = [
  {
    id: 1,
    title: "Amended June 16, 2025",
    amendedDate: "2025-06-16",
    status: "active",
    pdfUrl: "/downloads/udo-amended-2025-06-16.pdf"
  },
  {
    id: 2,
    title: "Amended February 17, 2025",
    amendedDate: "2025-02-17",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2025-02-17.pdf"
  },
  {
    id: 3,
    title: "Amended September 16, 2024",
    amendedDate: "2024-09-16",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-09-16.pdf"
  },
  {
    id: 4,
    title: "Amended June 24, 2024",
    amendedDate: "2024-06-24",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-06-24.pdf"
  },
  {
    id: 5,
    title: "Amended June 17, 2024",
    amendedDate: "2024-06-17",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-06-17.pdf"
  },
  {
    id: 6,
    title: "Amended May 20, 2024",
    amendedDate: "2024-05-20",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-05-20.pdf"
  },
  {
    id: 7,
    title: "Amended April 15, 2024",
    amendedDate: "2024-04-15",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-04-15.pdf"
  },
  {
    id: 8,
    title: "Amended January 16, 2024",
    amendedDate: "2024-01-16",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2024-01-16.pdf"
  },
  {
    id: 9,
    title: "Amended October 16, 2023",
    amendedDate: "2023-10-16",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2023-10-16.pdf"
  },
  {
    id: 10,
    title: "Amended August 21, 2023",
    amendedDate: "2023-08-21",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2023-08-21.pdf"
  },
  {
    id: 11,
    title: "Amended May 15, 2023",
    amendedDate: "2023-05-15",
    status: "archived",
    pdfUrl: "/downloads/udo-amended-2023-05-15.pdf"
  },
  {
    id: 12,
    title: "Adopted August 22, 2022",
    amendedDate: "2022-08-22",
    status: "archived",
    pdfUrl: "/downloads/udo-adopted-2022-08-22.pdf"
  },
  {
    id: 13,
    title: "Zoning Ordinance v1.1 (Legacy)",
    amendedDate: "2019-03-15",
    status: "superseded",
    externalUrl: "https://www.charlottenc.gov/Growth-and-Development/Planning-and-Development/Zoning/Zoning-Ordinance"
  },
  {
    id: 14,
    title: "Zoning Ordinance v1.0 (Legacy)",
    amendedDate: "2015-01-20",
    status: "superseded",
    externalUrl: "https://www.charlottenc.gov/Growth-and-Development/Planning-and-Development/Zoning/Zoning-Ordinance"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>;
    case 'superseded':
      return <Badge variant="outline" className="border-orange-300 text-orange-600">Superseded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function VersionsPage() {

  return (
    <DocsPage>
      <DocsBody className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Previous UDO Versions</h1>
          <p className="text-muted-foreground">Access historical versions of the Charlotte Unified Development Ordinance</p>
        </div>

        {/* Versions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Amended</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center w-[80px]">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {udoVersions.map((version) => (
                    <TableRow key={version.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{version.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(version.amendedDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(version.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {version.externalUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={version.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on Charlotte NC Website"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={version.pdfUrl}
                              download
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Alert className="mt-8 mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Notes</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Current Version:</strong> Always use the most current version for new development applications.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Legacy Documents:</strong> Historical versions are provided for reference and research purposes only. However, the legacy ordinance still applies to properties with conditional, optional, or exception zoning districts from the old ordinance.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Text Amendments:</strong> Check the Text Amendments section for the latest updates and modifications.</span>
            </div>
          </AlertDescription>
        </Alert>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Additional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/text-amendments">
                  <FileText className="h-4 w-4 mr-2" />
                  View Text Amendments
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/articles-listing">
                  <Eye className="h-4 w-4 mr-2" />
                  Browse All Articles
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://www.charlottenc.gov/Growth-and-Development/Planning-and-Development/Zoning/Zoning-Ordinance" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Legacy Zoning Ordinance
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
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