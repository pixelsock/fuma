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
  const isEnabled = params.get('visual-editing') === 'true'
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[isVisualEditingMode] URL:', window.location.href)
    console.log('[isVisualEditingMode] Query params:', window.location.search)
    console.log('[isVisualEditingMode] visual-editing param:', params.get('visual-editing'))
    console.log('[isVisualEditingMode] Enabled:', isEnabled)
  }
  
  return isEnabled
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
  const isServer = typeof window === 'undefined'
  const isVEMode = !isServer && isVisualEditingMode()

  console.log('[getDirectusAttr] Called with:', {
    collection,
    item,
    field,
    mode,
    isServer,
    isVEMode,
    willGenerate: !isServer && isVEMode
  })

  // Only generate attributes on client side in visual editing mode
  if (isServer) {
    console.log('[getDirectusAttr] Skipping - running on server')
    return undefined
  }
  if (!isVEMode) {
    console.log('[getDirectusAttr] Skipping - not in visual editing mode')
    return undefined
  }

  const attr = `collection:${collection};item:${item};fields:${field};mode:${mode}`
  console.log('[getDirectusAttr] Generated attribute:', attr)
  return attr
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
