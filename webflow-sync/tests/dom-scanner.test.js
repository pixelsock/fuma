/**
 * DOM Scanner tests
 * Tests for detecting and mapping elements with data-article-id attributes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanForArticles, getArticleElements, extractArticleId } from '../src/dom-scanner';

describe('DOM Scanner', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  describe('getArticleElements', () => {
    it('should find all elements with data-article-id attribute', () => {
      document.body.innerHTML = `
        <div data-article-id="123">Article 1</div>
        <span data-article-id="456">Article 2</span>
        <p data-article-id="789">Article 3</p>
        <div>No article ID</div>
      `;

      const elements = getArticleElements();
      
      expect(elements).toHaveLength(3);
      expect(elements[0].getAttribute('data-article-id')).toBe('123');
      expect(elements[1].getAttribute('data-article-id')).toBe('456');
      expect(elements[2].getAttribute('data-article-id')).toBe('789');
    });

    it('should return empty array when no elements have data-article-id', () => {
      document.body.innerHTML = `
        <div>No article</div>
        <span>Another element</span>
      `;

      const elements = getArticleElements();
      
      expect(elements).toHaveLength(0);
    });

    it('should handle nested elements with data-article-id', () => {
      document.body.innerHTML = `
        <div>
          <div data-article-id="parent">
            <span data-article-id="child">Nested</span>
          </div>
        </div>
      `;

      const elements = getArticleElements();
      
      expect(elements).toHaveLength(2);
      expect(elements[0].getAttribute('data-article-id')).toBe('parent');
      expect(elements[1].getAttribute('data-article-id')).toBe('child');
    });

    it('should handle elements with empty data-article-id', () => {
      document.body.innerHTML = `
        <div data-article-id="">Empty ID</div>
        <div data-article-id="valid">Valid ID</div>
      `;

      const elements = getArticleElements();
      
      expect(elements).toHaveLength(2);
      // Both elements should be found, filtering happens later
    });
  });

  describe('extractArticleId', () => {
    it('should extract valid article ID from element', () => {
      const element = document.createElement('div');
      element.setAttribute('data-article-id', '12345');

      const id = extractArticleId(element);
      
      expect(id).toBe('12345');
    });

    it('should return null for elements without data-article-id', () => {
      const element = document.createElement('div');

      const id = extractArticleId(element);
      
      expect(id).toBeNull();
    });

    it('should return null for empty data-article-id', () => {
      const element = document.createElement('div');
      element.setAttribute('data-article-id', '');

      const id = extractArticleId(element);
      
      expect(id).toBeNull();
    });

    it('should trim whitespace from article IDs', () => {
      const element = document.createElement('div');
      element.setAttribute('data-article-id', '  123  ');

      const id = extractArticleId(element);
      
      expect(id).toBe('123');
    });
  });

  describe('scanForArticles', () => {
    it('should return a map of article IDs to elements', () => {
      document.body.innerHTML = `
        <div data-article-id="123">Article 1</div>
        <span data-article-id="456">Article 2</span>
        <p data-article-id="789">Article 3</p>
      `;

      const articleMap = scanForArticles();
      
      expect(articleMap.size).toBe(3);
      expect(articleMap.has('123')).toBe(true);
      expect(articleMap.has('456')).toBe(true);
      expect(articleMap.has('789')).toBe(true);
      
      expect(articleMap.get('123')[0].tagName).toBe('DIV');
      expect(articleMap.get('456')[0].tagName).toBe('SPAN');
      expect(articleMap.get('789')[0].tagName).toBe('P');
    });

    it('should group multiple elements with same article ID', () => {
      document.body.innerHTML = `
        <div data-article-id="123">First instance</div>
        <div data-article-id="123">Second instance</div>
        <span data-article-id="123">Third instance</span>
      `;

      const articleMap = scanForArticles();
      
      expect(articleMap.size).toBe(1);
      expect(articleMap.has('123')).toBe(true);
      
      const elements = articleMap.get('123');
      expect(elements).toHaveLength(3);
      expect(elements[0].textContent).toBe('First instance');
      expect(elements[1].textContent).toBe('Second instance');
      expect(elements[2].textContent).toBe('Third instance');
    });

    it('should filter out invalid article IDs', () => {
      document.body.innerHTML = `
        <div data-article-id="">Empty</div>
        <div data-article-id="   ">Whitespace</div>
        <div data-article-id="valid123">Valid</div>
      `;

      const articleMap = scanForArticles();
      
      expect(articleMap.size).toBe(1);
      expect(articleMap.has('valid123')).toBe(true);
      expect(articleMap.has('')).toBe(false);
    });

    it('should return empty map when no valid elements exist', () => {
      document.body.innerHTML = `
        <div>No data attribute</div>
        <span data-other="123">Wrong attribute</span>
      `;

      const articleMap = scanForArticles();
      
      expect(articleMap.size).toBe(0);
    });

    it('should handle complex DOM structures', () => {
      document.body.innerHTML = `
        <article>
          <header data-article-id="header-123">Header</header>
          <div class="content">
            <p data-article-id="content-456">Paragraph</p>
            <aside>
              <div data-article-id="sidebar-789">Sidebar</div>
            </aside>
          </div>
          <footer data-article-id="header-123">Footer (same as header)</footer>
        </article>
      `;

      const articleMap = scanForArticles();
      
      expect(articleMap.size).toBe(3);
      expect(articleMap.get('header-123')).toHaveLength(2); // header and footer
      expect(articleMap.get('content-456')).toHaveLength(1);
      expect(articleMap.get('sidebar-789')).toHaveLength(1);
    });
  });
});