'use client';

import { useState, useEffect } from 'react';
import {
  type ColumnDef,
  type ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextAmendment } from '@/lib/types/text-amendments';

interface SimpleTextAmendmentsTableProps {
  className?: string;
}

export function SimpleTextAmendmentsTable({ className }: SimpleTextAmendmentsTableProps) {
  const [amendments, setAmendments] = useState<TextAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  useEffect(() => {
    async function fetchAmendments() {
      try {
        setLoading(true);
        const response = await fetch('/api/text-amendments');
        if (!response.ok) {
          throw new Error('Failed to fetch text amendments');
        }
        const data = await response.json();
        setAmendments(data);
      } catch (error) {
        console.error('Error fetching text amendments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAmendments();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const columns: ColumnDef<TextAmendment>[] = [
    {
      accessorKey: "petition_number",
      header: "Petition #",
      cell: ({ row }) => (
        <div className="font-medium text-sm whitespace-nowrap">{row.getValue("petition_number")}</div>
      ),
      size: 120,
      minSize: 80,
      maxSize: 200,
    },
    {
      accessorKey: "ordinance_number",
      header: "Ordinance #",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{row.getValue("ordinance_number")}</div>,
      size: 120,
      minSize: 80,
      maxSize: 200,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="text-sm min-w-0" title={title}>
            {title}
          </div>
        );
      },
      size: 300,
      minSize: 150,
      maxSize: 600,
    },
    {
      accessorKey: "filing_date",
      header: "Filing Date",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("filing_date"))}</div>,
      size: 110,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "public_hearing_date",
      header: "Public Hearing",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("public_hearing_date"))}</div>,
      size: 130,
      minSize: 100,
      maxSize: 180,
    },
    {
      accessorKey: "zoning_planning_committee_date",
      header: "Committee",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("zoning_planning_committee_date"))}</div>,
      size: 110,
      minSize: 80,
      maxSize: 150,
    },
    {
      accessorKey: "city_council_decision_date",
      header: "Council Decision",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("city_council_decision_date"))}</div>,
      size: 140,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "effective_date",
      header: "Effective Date",
      cell: ({ row }) => <div className="text-sm whitespace-nowrap">{formatDate(row.getValue("effective_date"))}</div>,
      size: 130,
      minSize: 100,
      maxSize: 180,
    },
  ];

  const table = useReactTable({
    data: amendments,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <Card className={className}>
      <CardHeader className="pb-2">
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
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>Text Amendment History</CardTitle>
        <CardDescription>
          Browse the complete history of UDO text amendments ({amendments.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Table with Resizing and Horizontal Scrolling */}
        <div className="overflow-x-auto border-0">
          <Table style={{ width: table.getTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="relative px-1 py-0.5 whitespace-nowrap"
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 hover:opacity-100 ${
                          header.column.getIsResizing()
                            ? "bg-primary opacity-100"
                            : ""
                        }`}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-1 py-0.5"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-12 text-center"
                    colSpan={columns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
