'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTableAdvanced1 from '@/components/data-table-advanced-1';

export default function TestKiboPatternsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">Kibo Patterns Registry Demo</h1>
          <p className="text-muted-foreground mb-6">
            This page showcases patterns from the Kibo UI Patterns Registry - a comprehensive collection of 1,105 production-ready shadcn/ui patterns.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Registry Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>About Kibo Patterns Registry</CardTitle>
                <CardDescription>
                  A comprehensive shadcn/ui registry containing 1,105 production-ready patterns from Kibo UI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📊 Data Display</h4>
                    <p className="text-sm text-muted-foreground">
                      200+ patterns including advanced data tables, charts, and layouts
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎨 Forms & Input</h4>
                    <p className="text-sm text-muted-foreground">
                      150+ patterns for forms, validation, and input components
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🔘 Interactive</h4>
                    <p className="text-sm text-muted-foreground">
                      180+ patterns for buttons, toggles, and interactive elements
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🧭 Navigation</h4>
                    <p className="text-sm text-muted-foreground">
                      80+ patterns for menus, breadcrumbs, and navigation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎭 Overlays</h4>
                    <p className="text-sm text-muted-foreground">
                      120+ patterns for modals, popovers, and overlays
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">💬 Feedback</h4>
                    <p className="text-sm text-muted-foreground">
                      90+ patterns for alerts, notifications, and feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expandable Data Table Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Advanced Data Table Pattern</CardTitle>
                <CardDescription>
                  An expandable data table with sub-rows - perfect for hierarchical data display
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTableAdvanced1 />
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>How to Use the Registry</CardTitle>
                <CardDescription>
                  Instructions for discovering and installing patterns from the Kibo registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">1. Search for Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the shadcn MCP server to search for patterns by category or functionality:
                    </p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      mcp_shadcn_search_items_in_registries --registries @kibo-patterns --query "data-table"
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">2. Install Patterns</h4>
                    <p className="text-sm text-muted-foreground">
                      Install any pattern directly using the shadcn CLI:
                    </p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      npx shadcn@latest add @kibo-patterns/pattern-data-table-advanced-1
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">3. Browse Categories</h4>
                    <p className="text-sm text-muted-foreground">
                      Explore patterns by category: buttons, forms, charts, navigation, overlays, and more.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Registry Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Registry Status</CardTitle>
                <CardDescription>
                  Current configuration and available patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Registry Server</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">
                      Running on http://localhost:3000
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Patterns Available</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">
                      1,105 production-ready patterns across 53 categories
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Components.json</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">
                      Configured with @kibo-patterns registry
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">MCP Integration</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">
                      shadcn MCP server enabled for pattern discovery
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

