/**
 * Content Renderer tests
 * Tests for safely injecting content into DOM elements
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  renderContent, 
  renderError, 
  sanitizeHTML,
  renderArticleContent,
  clearElementContent
} from '../src/content-renderer';

describe('Content Renderer', () => {
  let testElement;

  beforeEach(() => {
    // Create a test element for each test
    testElement = document.createElement('div');
    testElement.setAttribute('data-article-id', 'test-123');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  describe('sanitizeHTML', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Safe paragraph</p><strong>Bold text</strong>';
      const sanitized = sanitizeHTML(input);
      
      expect(sanitized).toBe(input);
    });

    it('should remove script tags', () => {
      const input = '<p>Text</p><script>alert("XSS")</script>';
      const sanitized = sanitizeHTML(input);
      
      expect(sanitized).toBe('<p>Text</p>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      const sanitized = sanitizeHTML(input);
      
      expect(sanitized).toBe('<div>Click me</div>');
    });

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const sanitized = sanitizeHTML(input);
      
      expect(sanitized).toBe('<a>Link</a>');
    });

    it('should preserve allowed attributes', () => {
      const input = '<a href="https://example.com" class="link">Link</a>';
      const sanitized = sanitizeHTML(input);
      
      expect(sanitized).toBe(input);
    });

    it('should handle empty and null content', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });
  });

  describe('renderContent', () => {
    it('should inject sanitized content into element', () => {
      const content = '<p>Article content</p>';
      renderContent(testElement, content);
      
      expect(testElement.innerHTML).toBe(content);
    });

    it('should clear existing content before rendering', () => {
      testElement.innerHTML = '<p>Old content</p>';
      const newContent = '<p>New content</p>';
      
      renderContent(testElement, newContent);
      
      expect(testElement.innerHTML).toBe(newContent);
    });

    it('should add loaded class after rendering', () => {
      renderContent(testElement, 'Content');
      
      expect(testElement.classList.contains('udo-content-loaded')).toBe(true);
    });

    it('should remove loading and error classes', () => {
      testElement.classList.add('udo-content-loading', 'udo-content-error');
      
      renderContent(testElement, 'Content');
      
      expect(testElement.classList.contains('udo-content-loading')).toBe(false);
      expect(testElement.classList.contains('udo-content-error')).toBe(false);
    });
  });

  describe('renderError', () => {
    it('should display user-friendly error message', () => {
      const error = new Error('Network error');
      renderError(testElement, error);
      
      expect(testElement.innerHTML).toContain('Unable to load content');
      expect(testElement.innerHTML).not.toContain('Network error'); // Don't expose technical details
    });

    it('should add error class', () => {
      renderError(testElement, new Error());
      
      expect(testElement.classList.contains('udo-content-error')).toBe(true);
    });

    it('should remove loading and loaded classes', () => {
      testElement.classList.add('udo-content-loading', 'udo-content-loaded');
      
      renderError(testElement, new Error());
      
      expect(testElement.classList.contains('udo-content-loading')).toBe(false);
      expect(testElement.classList.contains('udo-content-loaded')).toBe(false);
    });

    it('should display not found message for null content', () => {
      renderError(testElement, null);
      
      expect(testElement.innerHTML).toContain('Content not found');
    });
  });

  describe('renderArticleContent', () => {
    it('should render article content with proper structure', () => {
      const article = {
        id: '123',
        content: '<p>Article body</p>'
      };
      
      renderArticleContent(testElement, article);
      
      expect(testElement.innerHTML).toBe('<p>Article body</p>');
      expect(testElement.classList.contains('udo-content-loaded')).toBe(true);
    });

    it('should handle articles with empty content', () => {
      const article = {
        id: '123',
        content: ''
      };
      
      renderArticleContent(testElement, article);
      
      expect(testElement.innerHTML).toBe('');
      expect(testElement.classList.contains('udo-content-loaded')).toBe(true);
    });

    it('should handle null article object', () => {
      renderArticleContent(testElement, null);
      
      expect(testElement.innerHTML).toContain('Content not found');
      expect(testElement.classList.contains('udo-content-error')).toBe(true);
    });
  });

  describe('clearElementContent', () => {
    it('should clear element content', () => {
      testElement.innerHTML = '<p>Some content</p>';
      
      clearElementContent(testElement);
      
      expect(testElement.innerHTML).toBe('');
    });

    it('should add loading class', () => {
      clearElementContent(testElement);
      
      expect(testElement.classList.contains('udo-content-loading')).toBe(true);
    });

    it('should remove loaded and error classes', () => {
      testElement.classList.add('udo-content-loaded', 'udo-content-error');
      
      clearElementContent(testElement);
      
      expect(testElement.classList.contains('udo-content-loaded')).toBe(false);
      expect(testElement.classList.contains('udo-content-error')).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should handle full render cycle', () => {
      // Start with loading state
      clearElementContent(testElement);
      expect(testElement.classList.contains('udo-content-loading')).toBe(true);
      
      // Render content
      const article = {
        id: '123',
        content: '<h2>Title</h2><p>Body text</p>'
      };
      renderArticleContent(testElement, article);
      
      expect(testElement.innerHTML).toBe('<h2>Title</h2><p>Body text</p>');
      expect(testElement.classList.contains('udo-content-loaded')).toBe(true);
      expect(testElement.classList.contains('udo-content-loading')).toBe(false);
    });

    it('should handle error after loading state', () => {
      // Start with loading state
      clearElementContent(testElement);
      
      // Render error
      renderError(testElement, new Error('Failed to fetch'));
      
      expect(testElement.innerHTML).toContain('Unable to load content');
      expect(testElement.classList.contains('udo-content-error')).toBe(true);
      expect(testElement.classList.contains('udo-content-loading')).toBe(false);
    });
  });
});