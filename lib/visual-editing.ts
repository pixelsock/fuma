'use client'

import { apply, setAttr, remove, disable } from '@directus/visual-editing'
import { getDirectusUrl } from './env-config'
import { isVisualEditingMode } from './visual-editing-helpers'

// Export the setAttr helper for use in components
export { setAttr }

// Re-export server-safe helpers
export { isVisualEditingMode, getDirectusAttr, getDirectusAttrs } from './visual-editing-helpers'

let visualEditingEnabled = false
let currentDisable: (() => void) | null = null
let currentEnable: (() => void) | null = null
let currentRemove: (() => void) | null = null

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

    // Log all elements with data-directus attributes before calling apply
    const elementsWithAttr = document.querySelectorAll('[data-directus]')
    console.log('[Visual Editing] Found elements with data-directus:', elementsWithAttr.length)
    elementsWithAttr.forEach((el, i) => {
      console.log(`[Visual Editing] Element ${i}:`, {
        tag: el.tagName,
        attr: el.getAttribute('data-directus'),
        text: el.textContent?.substring(0, 50)
      })
    })

    const result = await apply({
      directusUrl,
      elements: options?.elements,
      customClass: options?.customClass as any,
      onSaved: options?.onSaved || (() => {
        console.log('[Visual Editing] Content saved, reloading page...')
        window.location.reload()
      })
    })

    console.log('[Visual Editing] Apply result:', result)

    if (result) {
      currentDisable = result.disable
      currentEnable = result.enable
      currentRemove = result.remove
      console.log('[Visual Editing] Result has disable/enable/remove functions:', {
        hasDisable: !!result.disable,
        hasEnable: !!result.enable,
        hasRemove: !!result.remove
      })
    }

    visualEditingEnabled = true
    console.log('[Visual Editing] Successfully initialized')

    // Log overlay elements after initialization
    const overlays = document.querySelectorAll('.directus-visual-editing-overlay')
    console.log('[Visual Editing] Overlay elements created:', overlays.length)
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
