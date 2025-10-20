'use client'

import { apply, setAttr, remove, disable } from '@directus/visual-editing'
import { getDirectusUrl } from './env-config'

// Export the setAttr helper for use in components
export { setAttr }

let visualEditingEnabled = false
let currentDisable: (() => void) | null = null
let currentEnable: (() => void) | null = null
let currentRemove: (() => void) | null = null

/**
 * Check if we're in visual editing mode
 * This checks for a query parameter that should be added to the visual editor URL
 */
export function isVisualEditingMode(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('visual-editing') === 'true'
}

/**
 * Initialize visual editing connection to Directus
 * Should be called after all elements with data-directus attributes are mounted
 */
export async function initVisualEditing(options?: {
  elements?: HTMLElement | HTMLElement[]
  customClass?: string[]
  onSaved?: (data: any) => void
}) {
  // Only enable in visual editing mode
  if (!isVisualEditingMode()) {
    console.log('[Visual Editing] Not in visual editing mode')
    return
  }

  if (visualEditingEnabled) {
    console.log('[Visual Editing] Already enabled')
    return
  }

  try {
    const directusUrl = getDirectusUrl()
    console.log('[Visual Editing] Initializing with URL:', directusUrl)

    const result = await apply({
      directusUrl,
      elements: options?.elements,
      customClass: options?.customClass as any,
      onSaved: options?.onSaved || (() => {
        console.log('[Visual Editing] Content saved, reloading page...')
        window.location.reload()
      })
    })

    if (result) {
      currentDisable = result.disable
      currentEnable = result.enable
      currentRemove = result.remove
    }

    visualEditingEnabled = true
    console.log('[Visual Editing] Successfully initialized')
  } catch (error) {
    console.error('[Visual Editing] Failed to initialize:', error)
  }
}

/**
 * Remove all visual editing elements
 * Should be called on client-side navigation
 */
export function removeVisualEditing() {
  if (currentRemove) {
    currentRemove()
    visualEditingEnabled = false
    currentDisable = null
    currentEnable = null
    currentRemove = null
    console.log('[Visual Editing] Removed')
  }
}

/**
 * Temporarily disable visual editing
 * Returns an enable function to re-enable
 */
export function disableVisualEditing() {
  if (currentDisable) {
    const result = currentDisable() as any
    if (result?.enable) {
      currentEnable = result.enable
      console.log('[Visual Editing] Disabled')
      return { enable: result.enable }
    }
  }
  return { enable: () => {} }
}

/**
 * Re-enable visual editing after disabling
 */
export function enableVisualEditing() {
  if (currentEnable) {
    currentEnable()
    console.log('[Visual Editing] Enabled')
  }
}

/**
 * Helper to generate data-directus attribute for a single field
 */
export function getDirectusAttr(
  collection: string,
  item: string | number,
  field: string,
  mode: 'drawer' | 'modal' | 'popover' = 'drawer'
) {
  if (!isVisualEditingMode()) return undefined
  return setAttr({ collection, item, fields: field, mode })
}

/**
 * Helper to generate data-directus attribute for multiple fields
 */
export function getDirectusAttrs(
  collection: string,
  item: string | number,
  fields: string[],
  mode: 'drawer' | 'modal' | 'popover' = 'drawer'
) {
  if (!isVisualEditingMode()) return undefined
  return setAttr({ collection, item, fields, mode })
}
