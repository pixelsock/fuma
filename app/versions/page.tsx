"use client";

import React, { useState } from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { 
  Download, 
  Eye,
  AlertCircle,
  FileText
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Sample data for UDO versions
const udoVersions = [
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
  const [selectedPdf, setSelectedPdf] = useState<{ title: string; url: string } | null>(null);
  const currentVersion = udoVersions.find(v => v.status === 'active');

  return (
    <DocsPage>
      <DocsBody className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Prior UDO Versions</h1>
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
                    <TableHead className="w-[60%]">Amended</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center w-[120px]">Actions</TableHead>
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
                        <div className="inline-flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPdf({ title: version.title, url: version.pdfUrl })}
                            className="h-8 w-8 p-0"
                            title="View PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={version.pdfUrl}
                              download
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* PDF Viewer Dialog */}
        <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
          <DialogContent className="max-w-6xl h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{selectedPdf?.title}</DialogTitle>
              <DialogDescription>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <a
                    href={selectedPdf?.url}
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-6 pt-2">
              <iframe
                src={selectedPdf?.url}
                className="w-full h-full rounded-md border"
                title={selectedPdf?.title}
              />
            </div>
          </DialogContent>
        </Dialog>

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


      </DocsBody>
    </DocsPage>
  );
}