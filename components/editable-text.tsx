'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { getDirectusAttr } from '@/lib/visual-editing-helpers'

interface EditableTextProps {
  collection: string
  itemId: string | number
  field: string
  mode?: 'drawer' | 'modal' | 'popover'
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span'
}

/**
 * Client component wrapper that adds visual editing attributes
 * Use this to wrap any text that should be editable in Directus
 */
export function EditableText({
  collection,
  itemId,
  field,
  mode = 'drawer',
  children,
  className,
  as: Component = 'div'
}: EditableTextProps) {
  const elementRef = useRef<HTMLElement>(null)

  // Set the attribute after mount to ensure it's in the DOM for the visual editor
  useEffect(() => {
    if (elementRef.current && typeof window !== 'undefined') {
      const attr = getDirectusAttr(collection, itemId, field, mode)

      console.log('[EditableText] Setting attribute on mounted element:', {
        collection,
        itemId,
        field,
        mode,
        attr,
        hasAttr: !!attr,
        element: elementRef.current.tagName
      })

      if (attr) {
        elementRef.current.setAttribute('data-directus', attr)
        console.log('[EditableText] Attribute set successfully:', elementRef.current.getAttribute('data-directus'))
      }
    }
  }, [collection, itemId, field, mode])

  return (
    <Component
      ref={elementRef as any}
      className={className}
    >
      {children}
    </Component>
  )
}
