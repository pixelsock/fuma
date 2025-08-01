import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'CharlotteUDOContentBridge',
      // Generate only IIFE format for browser usage
      formats: ['iife'],
      fileName: () => 'charlotte-udo-content-bridge.js'
    },
    rollupOptions: {
      // Ensure we don't have any external dependencies
      external: [],
      output: {
        // Use IIFE format for immediate execution
        format: 'iife',
        // Don't split code
        inlineDynamicImports: true,
        // Minimize global pollution
        extend: false,
        // Add banner comment
        banner: '/* Charlotte UDO Content Bridge v1.0.0 | (c) Charlotte UDO Team | MIT License */',
        // Ensure we don't have globals
        name: undefined
      }
    },
    // Single file output
    cssCodeSplit: false,
    // Target modern browsers that support ES6
    target: 'es2015',
    // Minify for production only
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: 'some' // Keep important comments like license
      }
    } : undefined
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
}));