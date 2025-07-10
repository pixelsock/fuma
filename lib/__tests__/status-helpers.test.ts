import { isPublishedStatus, getStatusLabel, isPubliclyViewable } from '../status-helpers';

describe('Status Helper Functions', () => {
  describe('isPublishedStatus', () => {
    it('should return true for "publish"', () => {
      expect(isPublishedStatus('publish')).toBe(true);
    });

    it('should return true for "published"', () => {
      expect(isPublishedStatus('published')).toBe(true);
    });

    it('should return true for case-insensitive variants', () => {
      expect(isPublishedStatus('PUBLISH')).toBe(true);
      expect(isPublishedStatus('PUBLISHED')).toBe(true);
      expect(isPublishedStatus('Publish')).toBe(true);
      expect(isPublishedStatus('Published')).toBe(true);
      expect(isPublishedStatus('PuBlIsH')).toBe(true);
    });

    it('should return false for non-published statuses', () => {
      expect(isPublishedStatus('draft')).toBe(false);
      expect(isPublishedStatus('archived')).toBe(false);
      expect(isPublishedStatus('pending')).toBe(false);
      expect(isPublishedStatus('review')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isPublishedStatus(null)).toBe(false);
      expect(isPublishedStatus(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isPublishedStatus('')).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should return "Published" for publish statuses', () => {
      expect(getStatusLabel('publish')).toBe('Published');
      expect(getStatusLabel('published')).toBe('Published');
      expect(getStatusLabel('PUBLISH')).toBe('Published');
    });

    it('should return "Draft" for draft status', () => {
      expect(getStatusLabel('draft')).toBe('Draft');
      expect(getStatusLabel('DRAFT')).toBe('Draft');
    });

    it('should return "Archived" for archived status', () => {
      expect(getStatusLabel('archived')).toBe('Archived');
      expect(getStatusLabel('ARCHIVED')).toBe('Archived');
    });

    it('should return capitalized version for unknown statuses', () => {
      expect(getStatusLabel('pending')).toBe('Pending');
      expect(getStatusLabel('REVIEW')).toBe('Review');
    });

    it('should return "Unknown" for null and undefined', () => {
      expect(getStatusLabel(null)).toBe('Unknown');
      expect(getStatusLabel(undefined)).toBe('Unknown');
    });
  });

  describe('isPubliclyViewable', () => {
    it('should behave the same as isPublishedStatus', () => {
      const testCases = [
        'publish',
        'published',
        'PUBLISH',
        'PUBLISHED',
        'draft',
        'archived',
        null,
        undefined,
        ''
      ];

      testCases.forEach(status => {
        expect(isPubliclyViewable(status)).toBe(isPublishedStatus(status));
      });
    });
  });
});
