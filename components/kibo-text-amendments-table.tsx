'use client';

import { useState, useEffect } from 'react';
import {
  type ColumnDef,
  type ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Search, Download, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface KiboTextAmendmentsTableProps {
  className?: string;
}

export function KiboTextAmendmentsTable({ className }: KiboTextAmendmentsTableProps) {
  const [amendments, setAmendments] = useState<TextAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'status', desc: false },
    { id: 'filing_date', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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

  const getStatusBadge = (amendment: TextAmendment) => {
    if (amendment.city_council_decision_date?.includes('Denied')) {
      return <Badge variant="destructive">Denied</Badge>;
    }
    if (amendment.public_hearing_date === 'Withdrawn') {
      return <Badge variant="secondary">Withdrawn</Badge>;
    }
    if (amendment.effective_date && amendment.effective_date !== 'N/A') {
      return <Badge variant="default">Effective</Badge>;
    }
    if (amendment.city_council_decision_date && !amendment.city_council_decision_date.includes('Denied')) {
      return <Badge variant="outline">Approved</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getStatusPriority = (amendment: TextAmendment): number => {
    if (amendment.effective_date && amendment.effective_date !== 'N/A') return 1;
    if (amendment.city_council_decision_date && !amendment.city_council_decision_date.includes('Denied')) return 2;
    if (amendment.city_council_decision_date?.includes('Denied')) return 4;
    if (amendment.public_hearing_date === 'Withdrawn') return 5;
    return 3;
  };

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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "petition_number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Petition #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.getValue("petition_number")}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "ordinance_number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Ordinance #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-sm">{row.getValue("ordinance_number")}</div>,
      size: 120,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="max-w-xs truncate text-sm" title={title}>
            {title}
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: "filing_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Filing Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("filing_date"))}</div>,
      size: 110,
    },
    {
      accessorKey: "public_hearing_date",
      header: "Public Hearing",
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("public_hearing_date"))}</div>,
      size: 130,
    },
    {
      accessorKey: "zoning_planning_committee_date",
      header: "Committee",
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("zoning_planning_committee_date"))}</div>,
      size: 110,
    },
    {
      accessorKey: "city_council_decision_date",
      header: "Council Decision",
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("city_council_decision_date"))}</div>,
      size: 140,
    },
    {
      accessorKey: "effective_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Effective Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("effective_date"))}</div>,
      size: 130,
    },
    {
      id: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amendment = row.original;
        return getStatusBadge(amendment);
      },
      sortingFn: (rowA, rowB) => {
        const priorityA = getStatusPriority(rowA.original);
        const priorityB = getStatusPriority(rowB.original);
        return priorityA - priorityB;
      },
      size: 120,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const amendment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(amendment.petition_number)}
              >
                Copy petition number
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(amendment.ordinance_number)}
              >
                Copy ordinance number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 80,
    },
  ];

  const table = useReactTable({
    data: amendments,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const currentPage = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 2;
    const showEllipsisEnd = currentPage < pageCount - 3;

    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i);
    }

    pages.push(0);

    if (showEllipsisStart) {
      pages.push("...");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    } else {
      pages.push(1, 2, 3);
    }

    if (showEllipsisEnd) {
      pages.push("...");
    } else if (currentPage < pageCount - 3) {
      pages.push(pageCount - 3, pageCount - 2);
    }

    if (currentPage >= pageCount - 3) {
      for (let i = Math.max(4, currentPage - 1); i < pageCount - 1; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }

    pages.push(pageCount - 1);

    return pages;
  };

  if (loading) {
    return (
      <Card className={`shadcn-data-table ${className}`}>
        <CardHeader>
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
    <Card className={`shadcn-data-table ${className}`}>
      <CardHeader>
        <CardTitle>Text Amendment History</CardTitle>
        <CardDescription>
          Browse the complete history of UDO text amendments ({amendments.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Controls */}
        <div className="flex items-center justify-between py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search amendments..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border bg-background">
          <div className="overflow-x-auto">
            <Table style={{ width: table.getTotalSize() }}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className="relative"
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
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Advanced Pagination */}
        <div className="flex items-center justify-center gap-1 py-4">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Button
                className="h-8 w-8 p-0"
                key={index}
                onClick={() => table.setPageIndex(page)}
                size="sm"
                variant={currentPage === page ? "default" : "outline"}
              >
                {page + 1}
              </Button>
            ) : (
              <span className="px-2" key={index}>
                {page}
              </span>
            )
          )}
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>

        <p className="mt-4 text-muted-foreground text-sm text-center">
          Drag column edges to resize • Click column headers to sort • Use search to filter results
        </p>
      </CardContent>
    </Card>
  );
}
