'use client';

import { useState, useEffect, useRef } from 'react';
import type { ColumnDef, ColumnResizeMode } from '@tanstack/react-table';
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/kibo-ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TextAmendment {
  id: string;
  petition_number: string;
  ordinance_number: string;
  title: string;
  filing_date: string;
  public_hearing_date: string;
  zoning_planning_committee_date: string;
  city_council_decision_date: string;
  effective_date: string;
}

interface KiboTextAmendmentsTableV3Props {
  className?: string;
}

export function KiboTextAmendmentsTableV3({ className }: KiboTextAmendmentsTableV3Props) {
  const [amendments, setAmendments] = useState<TextAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAmendments() {
      try {
        setLoading(true);
        const response = await fetch('/api/text-amendments');
        const data = await response.json();
        setAmendments(data);
      } catch (error) {
        console.error('Failed to fetch text amendments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAmendments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const columns: ColumnDef<TextAmendment>[] = [
    {
      accessorKey: "petition_number",
      header: "Petition #",
      cell: ({ row }) => (
        <div className="font-medium text-sm whitespace-nowrap">{row.getValue("petition_number")}</div>
      ),
      size: 140,
      minSize: 100,
    },
    {
      accessorKey: "ordinance_number",
      header: "Ordinance #",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{row.getValue("ordinance_number")}</div>,
      size: 140,
      minSize: 100,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="text-sm break-words" title={title}>
            {title}
          </div>
        );
      },
      size: 400,
      minSize: 250,
    },
    {
      accessorKey: "filing_date",
      header: "Filing Date",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("filing_date"))}</div>,
      size: 130,
      minSize: 100,
    },
    {
      accessorKey: "public_hearing_date",
      header: "Public Hearing",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("public_hearing_date"))}</div>,
      size: 150,
      minSize: 120,
    },
    {
      accessorKey: "zoning_planning_committee_date",
      header: "Committee",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("zoning_planning_committee_date"))}</div>,
      size: 130,
      minSize: 100,
    },
    {
      accessorKey: "city_council_decision_date",
      header: "Council Decision",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("city_council_decision_date"))}</div>,
      size: 160,
      minSize: 120,
    },
    {
      accessorKey: "effective_date",
      header: "Effective Date",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("effective_date"))}</div>,
      size: 150,
      minSize: 120,
    },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-1">
          <CardTitle>Text Amendments</CardTitle>
          <CardDescription>Loading text amendments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} !pt-0 !mt-0 !gap-0`}>
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Text Amendment History</CardTitle>
            <CardDescription>
              Browse the complete history of UDO text amendments ({amendments.length} total)
            </CardDescription>
          </div>
          {/* Scroll Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 px-4 md:px-8">
        
        {/* Table Container with Border */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto border border-border rounded-md mb-6"
        >
          <div style={{ minWidth: '1400px' }}>
            <TableProvider
              columns={columns}
              data={amendments}
              className="w-full"
              columnResizeMode={columnResizeMode}
            >
              <TableHeader>
                {({ headerGroup }) => (
                  <TableHeaderGroup key={headerGroup.id} headerGroup={headerGroup}>
                    {({ header }) => (
                      <TableHead key={header.id} header={header} className="px-0.5 py-0 border-0 bg-transparent" />
                    )}
                  </TableHeaderGroup>
                )}
              </TableHeader>
              <TableBody>
                {({ row }) => (
                  <TableRow key={row.id} row={row}>
                    {({ cell }) => (
                      <TableCell key={cell.id} cell={cell} className="px-0.5 py-0 border-0 bg-transparent" />
                    )}
                  </TableRow>
                )}
              </TableBody>
            </TableProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
