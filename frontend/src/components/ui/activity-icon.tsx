import { Plane, Hotel, Ticket, Car, MapPin } from 'lucide-react'
import type { ActivityType } from '@/types/simple'
import type { CSSProperties } from 'react'
import { getActivityColor } from '@/lib/activity-config'

const iconMap = {
  flight: Plane,
  stay: Hotel,
  event: Ticket,
  transport: Car,
} as const

interface ActivityIconProps {
  type: ActivityType
  size?: number
  className?: string
  style?: CSSProperties
  /** When true, automatically applies the activity type's color */
  colored?: boolean
}

/**
 * Renders an SVG icon for the given activity type.
 * Centralizes all activity icon definitions - change icons here to update everywhere.
 */
export function ActivityIcon({ type, size = 16, className = '', style, colored = false }: ActivityIconProps) {
  const IconComponent = iconMap[type] ?? MapPin
  
  const computedStyle: CSSProperties = colored 
    ? { color: getActivityColor(type), ...style }
    : style ?? {}
  
  return <IconComponent size={size} className={className} style={computedStyle} />
}
