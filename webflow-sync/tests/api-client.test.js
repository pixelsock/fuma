/**
 * API Client tests
 * Tests for the Directus API integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchArticle } from '../src/api-client';

describe('API Client', () => {
  let originalFetch;

  beforeEach(() => {
    // Store original fetch
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('fetchArticle', () => {
    it('should fetch article successfully with valid ID', async () => {
      const mockArticleData = {
        data: {
          id: '123',
          content: '<p>Test article content</p>',
          title: 'Test Article',
          status: 'published'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockArticleData
      });

      const result = await fetchArticle('123');

      expect(fetch).toHaveBeenCalledWith(
        'https://admin.charlotteudo.org/items/123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        id: '123',
        content: '<p>Test article content</p>'
      });
    });

    it('should return null for 404 not found errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await fetchArticle('nonexistent');

      expect(result).toBeNull();
      expect(fetch).toHaveBeenCalledWith(
        'https://admin.charlotteudo.org/items/nonexistent',
        expect.any(Object)
      );
    });

    it('should throw error for server errors (5xx)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(fetchArticle('123')).rejects.toThrow('Server error: 500 Internal Server Error');
    });

    it('should throw error for network failures', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(fetchArticle('123')).rejects.toThrow('Network error');
    });

    it('should handle empty content field gracefully', async () => {
      const mockArticleData = {
        data: {
          id: '123',
          title: 'Test Article',
          status: 'published'
          // content field is missing
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockArticleData
      });

      const result = await fetchArticle('123');

      expect(result).toEqual({
        id: '123',
        content: ''
      });
    });

    it('should handle malformed JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(fetchArticle('123')).rejects.toThrow('Invalid JSON');
    });

    it('should include proper CORS headers', async () => {
      const mockArticleData = {
        data: {
          id: '123',
          content: 'Test content'
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockArticleData
      });

      await fetchArticle('123');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          mode: 'cors',
          credentials: 'omit'
        })
      );
    });

    it('should log errors in development mode', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      try {
        await fetchArticle('123');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Charlotte UDO Widget] API Error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      delete process.env.NODE_ENV;
    });
  });
});