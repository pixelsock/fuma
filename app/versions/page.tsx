import React from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import {
  Download,
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPublicDirectusClient } from '@/lib/directus-server';
import { readSingleton } from '@directus/sdk';

// Type for UDO version entries from Directus
type VersionEntry = {
  amended_date: string;
  link_type: 'file' | 'link';
  file_id?: string;
  title?: string;
  external_link?: string;
  is_current?: boolean;
};

type VersionsPageData = {
  page_title: string;
  page_description: string;
  available_versions: VersionEntry[];
  important_notes: string;
  additional_resources: Array<{
    title: string;
    url: string;
    icon?: string;
  }>;
  current_version: string;
};

export default async function VersionsPage() {
  const directus = await getPublicDirectusClient();

  const data = await directus.request<VersionsPageData>(
    readSingleton('versions_page', {
      fields: ['*']
    })
  );

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

  return (
    <DocsPage>
      <DocsBody className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{data.page_title}</h1>
          <p className="text-muted-foreground">{data.page_description}</p>
        </div>

        {/* Versions Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80%]">Amended</TableHead>
                    <TableHead className="text-center w-[80px]">Download</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.available_versions.map((version, index) => {
                    const formattedDate = new Date(version.amended_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    
                    const displayTitle = version.link_type === 'link' && version.title 
                      ? version.title 
                      : `Amended ${formattedDate}`;
                    
                    const fileUrl = version.link_type === 'file' && version.file_id
                      ? `${directusUrl}/assets/${version.file_id}`
                      : version.external_link;

                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">{displayTitle}</div>
                              {version.is_current && (
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Current Version
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formattedDate}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {version.link_type === 'link' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <a
                                href={version.external_link}
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
                                href={fileUrl}
                                download
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        {data.important_notes && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="mb-4">Important Notes</AlertTitle>
            <AlertDescription 
              className="prose prose-sm max-w-none prose-ul:my-2 prose-li:my-1 prose-strong:font-semibold prose-p:my-2"
              dangerouslySetInnerHTML={{ __html: data.important_notes }}
            />
          </Alert>
        )}

        {/* Additional Resources */}
        {data.additional_resources && data.additional_resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.additional_resources.map((resource, index) => (
                  <Button key={index} variant="outline" className="w-full justify-start" asChild>
                    <a 
                      href={resource.url}
                      target={resource.url.startsWith('http') ? '_blank' : undefined}
                      rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {resource.title}
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DocsBody>
    </DocsPage>
  );
}