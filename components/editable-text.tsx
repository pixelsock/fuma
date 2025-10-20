'use client'

import { ReactNode } from 'react'
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
  const dataDirectus = getDirectusAttr(collection, itemId, field, mode)
  
  return (
    <Component 
      className={className}
      data-directus={dataDirectus}
    >
      {children}
    </Component>
  )
}
