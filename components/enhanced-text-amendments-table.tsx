'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TextAmendment } from '@/lib/types/text-amendments';

interface EnhancedTextAmendmentsTableProps {
  className?: string;
}

export function EnhancedTextAmendmentsTable({ className }: EnhancedTextAmendmentsTableProps) {
  const [amendments, setAmendments] = useState<TextAmendment[]>([]);
  const [loading, setLoading] = useState(true);

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
    },
    {
      accessorKey: "petition_number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Petition #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("petition_number")}</div>
      ),
    },
    {
      accessorKey: "ordinance_number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Ordinance #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("ordinance_number")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        return (
          <div className="max-w-xs truncate" title={title}>
            {title}
          </div>
        );
      },
    },
    {
      accessorKey: "filing_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Filing Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("filing_date")}</div>,
    },
    {
      accessorKey: "public_hearing_date",
      header: "Public Hearing",
      cell: ({ row }) => <div>{row.getValue("public_hearing_date")}</div>,
    },
    {
      accessorKey: "zoning_planning_committee_date",
      header: "Committee Date",
      cell: ({ row }) => <div>{row.getValue("zoning_planning_committee_date")}</div>,
    },
    {
      accessorKey: "city_council_decision_date",
      header: "Council Decision",
      cell: ({ row }) => <div>{row.getValue("city_council_decision_date")}</div>,
    },
    {
      accessorKey: "effective_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Effective Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("effective_date")}</div>,
    },
    {
      id: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
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
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Download PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={amendments}
      searchKey="title"
      searchPlaceholder="Search amendments by title, petition number, or ordinance number..."
      enableColumnVisibility={true}
      enableRowSelection={true}
      enablePagination={true}
      enableSearch={true}
      pageSize={25}
      className={className}
    />
  );
}

