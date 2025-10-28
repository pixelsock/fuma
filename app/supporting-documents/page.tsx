'use client';

import React, { useState, useEffect } from 'react';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { Search, X, ExternalLink, FileText, Building2, LayoutGrid, List } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TableContainer } from '@/components/ui/table-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SupportingDocument {
  id: string;
  title: string;
  status: 'available' | 'in_development' | 'pending';
  managed_by?: string;
  link?: string;
  file?: string;
}

interface PageData {
  page_title: string;
  page_description: string;
}

export default function SupportingDocumentsPage() {
  const [documents, setDocuments] = useState<SupportingDocument[]>([]);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch page data and documents from API
        const [pageResponse, docsResponse] = await Promise.all([
          fetch('/api/supporting-documents-page'),
          fetch('/api/supporting-documents')
        ]);
        
        if (pageResponse.ok) {
          const page = await pageResponse.json();
          setPageData(page);
        }
        
        if (docsResponse.ok) {
          const docs = await docsResponse.json();
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setSearchTerm('');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.managed_by?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(doc.status);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'in_development':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in_development':
        return 'In Development';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <DocsPage>
        <DocsBody className="max-w-content mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading supporting documents...</p>
          </div>
        </DocsBody>
      </DocsPage>
    );
  }

  return (
    <DocsPage>
      <DocsBody className="max-w-content mx-auto">
        <div className="w-full min-w-full space-y-6">
          {/* Header */}
          <div className="w-full min-w-full">
            <h1 className="text-3xl font-bold tracking-tight">
              {pageData?.page_title || 'Supporting Documents'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {pageData?.page_description || `Browse ${documents.length} supporting documents`}
            </p>
          </div>

          {/* Table Container */}
          <div className="w-full min-w-full rounded-lg border bg-card">
            {/* Toolbar */}
            <div className="p-4 border-b">
              <div className="flex flex-col gap-4">
                {/* Search and View Toggle Row */}
                <div className="flex gap-3 items-center">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-2">
                    <div className="flex gap-1 border rounded-md p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-3 hover:!bg-[color-mix(in_oklab,var(--color-fd-background)_25%,var(--color-fd-primary))]"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 px-3 hover:!bg-[color-mix(in_oklab,var(--color-fd-background)_25%,var(--color-fd-primary))]"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status Filters Row */}
                <div className="flex flex-wrap items-center gap-3">

                  <span className="text-sm font-medium">Status:</span>
                  <Button
                    variant={statusFilters.includes('available') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatusFilter('available')}
                  >
                    Available
                  </Button>
                  <Button
                    variant={statusFilters.includes('in_development') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatusFilter('in_development')}
                  >
                    In Development
                  </Button>
                  <Button
                    variant={statusFilters.includes('pending') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  
                  {(statusFilters.length > 0 || searchTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Results Count */}
                {filteredDocuments.length !== documents.length && (
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredDocuments.length} of {documents.length} documents
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No documents found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === 'list' ? (
              <TableContainer>
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Document Title</TableHead>
                  <TableHead className="min-w-[200px]">Status</TableHead>
                  <TableHead className="min-w-[200px]">Managed By</TableHead>
                  <TableHead className="min-w-[75px] text-center">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => {
                  const hasLink = Boolean(doc.link || doc.file);
                  const documentHref = doc.link || (doc.file ? `/api/files/${doc.file}` : '#');

                  return (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          {doc.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(doc.status)}>
                          {getStatusLabel(doc.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.managed_by && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">{doc.managed_by}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {hasLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <a
                              href={documentHref}
                              target={doc.link ? '_blank' : undefined}
                              rel={doc.link ? 'noopener noreferrer' : undefined}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
              </TableContainer>
            ) : (
              <div className="w-full p-6">
                <div className="w-full grid gap-4 sm:grid-cols-2">
            {filteredDocuments.map((doc) => {
              const hasLink = Boolean(doc.link || doc.file);
              const documentHref = doc.link || (doc.file ? `/api/files/${doc.file}` : '#');

              return (
                <Card
                  key={doc.id}
                  className="relative overflow-hidden border border-border/70 bg-background/40 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <CardHeader className="relative flex flex-row items-start justify-between gap-4 pb-3 flex-shrink-0">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-lg font-semibold leading-snug text-foreground">
                        <span className="line-clamp-2">{doc.title}</span>
                      </CardTitle>
                      {doc.managed_by && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">{doc.managed_by}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(doc.status)} className="shrink-0">
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="relative flex flex-col gap-3 flex-1">
                    <div className="text-sm text-muted-foreground flex-1">
                      {hasLink
                        ? 'Access the supporting material for detailed standards and references.'
                        : 'No online resource available. Please check back later.'}
                    </div>

                    {hasLink && doc.status === 'available' && (
                      <div className="flex justify-end mt-auto">
                        <Button
                          asChild
                          size="sm"
                          className="gap-2 [&>a]:no-underline bg-[hsl(28_87%_67%)] hover:bg-[hsl(28_87%_60%)] text-white"
                        >
                          <a
                            href={documentHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                          >
                            Open Document
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  </Card>
                );
              })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
