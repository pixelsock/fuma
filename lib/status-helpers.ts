/**
 * Helper function to check if a status indicates the article is published
 * Returns true for 'publish', 'published', and their case-insensitive variants
 * 
 * @param status - The status string to check (can be null or undefined)
 * @returns boolean - true if the status indicates published content
 * 
 * @example
 * isPublishedStatus('publish') // true
 * isPublishedStatus('published') // true
 * isPublishedStatus('PUBLISHED') // true
 * isPublishedStatus('draft') // false
 * isPublishedStatus(null) // false
 * isPublishedStatus(undefined) // false
 */
export function isPublishedStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase();
  return ['publish', 'published', 'draft'].includes(normalizedStatus);
}

/**
 * Helper function to get a human-readable status label
 * 
 * @param status - The status string
 * @returns string - A human-readable status label
 */
export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  
  const normalizedStatus = status.toLowerCase();
  switch (normalizedStatus) {
    case 'publish':
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'archived':
      return 'Archived';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

/**
 * Helper function to check if a status allows public viewing
 * Currently identical to isPublishedStatus, but kept separate for future extensibility
 * 
 * @param status - The status string to check
 * @returns boolean - true if the content can be viewed publicly
 */
export function isPubliclyViewable(status: string | null | undefined): boolean {
  return isPublishedStatus(status);
}
