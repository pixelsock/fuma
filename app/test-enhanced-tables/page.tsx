'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for demonstration
type SampleData = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  lastLogin: string;
  department: string;
};

const sampleData: SampleData[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@charlottenc.gov',
    status: 'active',
    role: 'Administrator',
    lastLogin: '2024-01-15',
    department: 'Planning',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@charlottenc.gov',
    status: 'active',
    role: 'Planner',
    lastLogin: '2024-01-14',
    department: 'Planning',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@charlottenc.gov',
    status: 'pending',
    role: 'Reviewer',
    lastLogin: '2024-01-10',
    department: 'Zoning',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@charlottenc.gov',
    status: 'inactive',
    role: 'Analyst',
    lastLogin: '2023-12-20',
    department: 'Planning',
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie.wilson@charlottenc.gov',
    status: 'active',
    role: 'Manager',
    lastLogin: '2024-01-16',
    department: 'Zoning',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const columns: ColumnDef<SampleData>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("department")}</div>,
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("role")}</div>,
  },
  {
    accessorKey: "status",
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
      const status = row.getValue("status") as string;
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("lastLogin")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

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
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
            <DropdownMenuItem>Send email</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function TestEnhancedTablesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Enhanced Data Tables Demo</h1>
          <p className="text-muted-foreground mb-6">
            This page showcases the new shadcn/ui data table components with advanced features like sorting, filtering, pagination, and row selection.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Basic Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Data Table</CardTitle>
                <CardDescription>
                  A simple data table with sorting, filtering, and pagination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={sampleData}
                  searchKey="name"
                  searchPlaceholder="Search by name or email..."
                  enableColumnVisibility={true}
                  enableRowSelection={true}
                  enablePagination={true}
                  enableSearch={true}
                  pageSize={10}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Minimal Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Minimal Table</CardTitle>
                <CardDescription>
                  A simplified table with minimal features enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns.slice(1, 5)} // Remove select and actions columns
                  data={sampleData}
                  searchKey="name"
                  searchPlaceholder="Search users..."
                  enableColumnVisibility={false}
                  enableRowSelection={false}
                  enablePagination={true}
                  enableSearch={true}
                  pageSize={5}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>New Data Table Features</CardTitle>
                <CardDescription>
                  Key improvements over the previous table implementations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Advanced Sorting</h4>
                    <p className="text-sm text-muted-foreground">
                      Click column headers to sort data in ascending or descending order
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Global Search</h4>
                    <p className="text-sm text-muted-foreground">
                      Search across all visible columns with real-time filtering
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Column Visibility</h4>
                    <p className="text-sm text-muted-foreground">
                      Show/hide columns dynamically with the columns dropdown
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Row Selection</h4>
                    <p className="text-sm text-muted-foreground">
                      Select individual rows or all rows for bulk operations
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Pagination Controls</h4>
                    <p className="text-sm text-muted-foreground">
                      Navigate through large datasets with customizable page sizes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Action Menus</h4>
                    <p className="text-sm text-muted-foreground">
                      Contextual actions for each row with dropdown menus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

