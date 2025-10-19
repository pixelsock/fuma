'use client'

import React from 'react'

interface MaterialIconProps {
  iconName: string
  className?: string
  style?: React.CSSProperties
  size?: number
}

/**
 * Material Symbols icon component using Google Fonts
 * Displays icons using the Material Symbols font
 */
export function MaterialIcon({ iconName, className = '', style, size = 24 }: MaterialIconProps) {
  if (!iconName) return null

  // Material Symbols uses snake_case directly
  const iconStyle: React.CSSProperties = {
    fontSize: size,
    ...style,
  }

  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={iconStyle}
      aria-hidden="true"
    >
      {iconName}
    </span>
  )
}
