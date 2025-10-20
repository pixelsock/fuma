'use client'

import { useEffect } from 'react'
import { initVisualEditing, removeVisualEditing, isVisualEditingMode } from '@/lib/visual-editing'

/**
 * Visual Editing Provider Component
 * This component initializes the Directus visual editing connection
 * and should be included in your root layout
 */
export function VisualEditingProvider() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if we're in visual editing mode
    if (!isVisualEditingMode()) {
      console.log('[VisualEditingProvider] Not in visual editing mode')
      return
    }

    console.log('[VisualEditingProvider] Initializing visual editing...')

    // Wait for DOM to be fully loaded
    const initTimeout = setTimeout(() => {
      initVisualEditing({
        onSaved: ({ collection, item, payload }) => {
          console.log('[VisualEditingProvider] Content saved:', { collection, item, payload })
          // Reload the page to show updated content
          window.location.reload()
        }
      })
    }, 500) // Small delay to ensure all elements are mounted

    // Cleanup on unmount or navigation
    return () => {
      clearTimeout(initTimeout)
      removeVisualEditing()
    }
  }, [])

  // This component doesn't render anything
  return null
}
