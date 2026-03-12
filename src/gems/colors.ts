import type { GemColor } from './types'
import type { CSSProperties } from 'react'

const COLOR_MAP: Record<GemColor, string> = {
  red: '#f87171',
  green: '#4ade80',
  blue: '#60a5fa',
  white: '#e5e7eb',
}

export function gemColorStyle(color: GemColor): CSSProperties {
  return { color: COLOR_MAP[color] ?? '#e5e7eb' }
}
