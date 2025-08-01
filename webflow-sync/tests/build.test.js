/**
 * Build configuration tests
 * Ensures the Vite build system produces the expected output
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

describe('Build Configuration', () => {
  it('should have a dist directory with built files', async () => {
    const distExists = await fs.access(distPath).then(() => true).catch(() => false);
    expect(distExists).toBe(true);
  });

  it('should generate a single JavaScript output file', async () => {
    const files = await fs.readdir(distPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    expect(jsFiles.length).toBe(1);
    expect(jsFiles[0]).toMatch(/charlotte-udo-content-bridge/);
  });

  it('should create an IIFE format for browser usage', async () => {
    const files = await fs.readdir(distPath);
    const jsFile = files.find(f => f.endsWith('.js'));
    const content = await fs.readFile(path.join(distPath, jsFile), 'utf-8');
    
    // Check for IIFE pattern - either minified !function() or (function()
    expect(content).toMatch(/^(\!function|\(function)/);
  });

  it('should not pollute global scope', async () => {
    const files = await fs.readdir(distPath);
    const jsFile = files.find(f => f.endsWith('.js'));
    const content = await fs.readFile(path.join(distPath, jsFile), 'utf-8');
    
    // Should not have direct global assignments
    expect(content).not.toMatch(/window\.\w+\s*=/);
    expect(content).not.toMatch(/global\.\w+\s*=/);
  });
});