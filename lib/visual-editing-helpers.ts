/**
 * Server-safe visual editing helpers
 * These functions can be used in both server and client components
 */

/**
 * Check if we're in visual editing mode (server-safe version)
 * Returns false on server, checks query param on client
 */
export function isVisualEditingMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('visual-editing') === 'true'
}

/**
 * Generate data-directus attribute string for a single field
 * This is a server-safe version that manually constructs the attribute
 */
export function getDirectusAttr(
  collection: string,
  item: string | number,
  field: string,
  mode: 'drawer' | 'modal' | 'popover' = 'drawer'
): string | undefined {
  // Only generate attributes on client side in visual editing mode
  if (typeof window === 'undefined') return undefined
  if (!isVisualEditingMode()) return undefined
  
  return `collection:${collection};item:${item};fields:${field};mode:${mode}`
}

/**
 * Generate data-directus attribute string for multiple fields
 * This is a server-safe version that manually constructs the attribute
 */
export function getDirectusAttrs(
  collection: string,
  item: string | number,
  fields: string[],
  mode: 'drawer' | 'modal' | 'popover' = 'drawer'
): string | undefined {
  // Only generate attributes on client side in visual editing mode
  if (typeof window === 'undefined') return undefined
  if (!isVisualEditingMode()) return undefined
  
  const fieldsStr = fields.join(',')
  return `collection:${collection};item:${item};fields:${fieldsStr};mode:${mode}`
}
