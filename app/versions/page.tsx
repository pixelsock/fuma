"use client";

import React, { useState } from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { 
  Download, 
  Eye,
  AlertCircle,
  FileText,
  ExternalLink
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
    title: "Unified Development Ordinance v2.0 (Current)",
    amendedDate: "2023-06-01",
    status: "active",
    pdfUrl: "/downloads/udo-v2.0.pdf"
  },
  {
    id: 2,
    title: "Unified Development Ordinance v1.3 (Draft)",
    amendedDate: "2022-12-15",
    status: "archived",
    pdfUrl: "/downloads/udo-v1.3-draft.pdf"
  },
  {
    id: 3,
    title: "Unified Development Ordinance v1.2 (Public Review)",
    amendedDate: "2022-09-30",
    status: "archived",
    pdfUrl: "/downloads/udo-v1.2-review.pdf"
  },
  {
    id: 4,
    title: "Zoning Ordinance v1.1 (Legacy)",
    amendedDate: "2019-03-15",
    status: "superseded",
    pdfUrl: "/downloads/zoning-ordinance-v1.1.pdf"
  },
  {
    id: 5,
    title: "Zoning Ordinance v1.0 (Legacy)",
    amendedDate: "2015-01-20",
    status: "superseded",
    pdfUrl: "/downloads/zoning-ordinance-v1.0.pdf"
  },
  {
    id: 6,
    title: "Text Amendments Archive",
    amendedDate: "2023-07-15",
    status: "active",
    pdfUrl: "/downloads/udo-amendments-archive.zip"
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
            <CardDescription>
              Click the eye icon to view documents in the PDF viewer
            </CardDescription>
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
              <span><strong>Current Version:</strong> Always use the most current active version for new development applications.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">•</span>
              <span><strong>Legacy Documents:</strong> Historical versions are provided for reference and research purposes only.</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <a href="https://charlotteudo.org">
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