'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KiboTextAmendmentsTableV3 } from '@/components/kibo-text-amendments-table-v3';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, MousePointer, Search, Filter, Download } from 'lucide-react';

export default function TestKiboTextAmendmentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Zap className="w-3 h-3 mr-1" />
              Kibo Enhanced
            </Badge>
            <h1 className="text-3xl font-bold">Text Amendments Table</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Experience the power of the Kibo Patterns Registry with this advanced data table implementation featuring resizable columns, advanced pagination, and enhanced user interactions.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Features</CardTitle>
                <CardDescription>
                  Advanced functionality powered by the Kibo Patterns Registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Resizable Columns</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag column edges to resize and customize your view
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Smart Search</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Real-time filtering across all visible columns
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Advanced Sorting</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click headers to sort with custom status prioritization
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Bulk Actions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select multiple rows for batch operations
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Numeric Pagination</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Smart pagination with ellipsis for large datasets
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Quick Actions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Context menus with copy, view, and download options
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* The Enhanced Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <KiboTextAmendmentsTableV3 />
          </motion.div>

          {/* Implementation Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Implementation Highlights</CardTitle>
                <CardDescription>
                  Built using patterns from the Kibo UI Registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Pattern Sources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">pattern-data-table-advanced-2</p>
                        <p className="text-xs text-muted-foreground">Numeric pagination with ellipsis</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">pattern-data-table-advanced-3</p>
                        <p className="text-xs text-muted-foreground">Resizable columns with drag handles</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Enhanced Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Custom status badges with priority-based sorting</li>
                      <li>• Formatted date display with fallback handling</li>
                      <li>• Row selection with bulk action capabilities</li>
                      <li>• Responsive design with horizontal scrolling</li>
                      <li>• Loading states and error handling</li>
                      <li>• Accessible keyboard navigation</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Performance Optimizations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Efficient pagination with 25 items per page</li>
                      <li>• Client-side filtering and sorting</li>
                      <li>• Optimized column sizing with minimum widths</li>
                      <li>• Debounced search input</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
                <CardDescription>
                  Get the most out of the enhanced text amendments table
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Navigation</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li><strong>Search:</strong> Type in the search box to filter by title, petition number, or ordinance number</li>
                      <li><strong>Sort:</strong> Click column headers to sort data (click again to reverse)</li>
                      <li><strong>Resize:</strong> Drag the right edge of column headers to resize</li>
                      <li><strong>Select:</strong> Use checkboxes to select individual or all rows</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Actions</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li><strong>Copy:</strong> Use the actions menu to copy petition or ordinance numbers</li>
                      <li><strong>View:</strong> Access detailed information about each amendment</li>
                      <li><strong>Download:</strong> Export individual or selected amendments as PDF</li>
                      <li><strong>Pagination:</strong> Use numbered pagination to navigate large datasets</li>
                    </ul>
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

