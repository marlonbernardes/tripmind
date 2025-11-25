import { useState, useCallback, useEffect } from 'react'
import type { SimpleActivity } from '@/types/simple'
import type { ViewModeConfig } from '../types'

export function useGanttDrag(
  activity: SimpleActivity,
  viewModeConfig: ViewModeConfig,
  ganttStart: Date,
  onUpdate?: (activityId: string, newDates: { start: string; end?: string }) => void
) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(null)
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      date: new Date(activity.start)
    })
  }, [activity.start])
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.touches[0].clientX,
      date: new Date(activity.start)
    })
  }, [activity.start])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart || !onUpdate) return
    
    // Calculate delta in pixels
    const deltaX = e.clientX - dragStart.x
    
    // Convert to time delta
    const deltaCols = deltaX / viewModeConfig.columnWidth
    const deltaMs = deltaCols * viewModeConfig.step
    
    // Snap to grid
    const snappedDelta = Math.round(deltaMs / viewModeConfig.snapInterval) * viewModeConfig.snapInterval
    
    // Calculate new dates - preserve the original start date from dragStart
    const newStart = new Date(dragStart.date.getTime() + snappedDelta)
    
    // Calculate duration based on original activity dates
    const originalStart = new Date(activity.start).getTime()
    const originalEnd = activity.end ? new Date(activity.end).getTime() : originalStart + 3600000
    const duration = originalEnd - originalStart
    
    const newEnd = new Date(newStart.getTime() + duration)
    
    // Update activity
    onUpdate(activity.id, {
      start: newStart.toISOString(),
      end: newEnd.toISOString()
    })
  }, [isDragging, dragStart, activity, viewModeConfig, onUpdate])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStart || !onUpdate) return
    
    // Calculate delta in pixels
    const deltaX = e.touches[0].clientX - dragStart.x
    
    // Convert to time delta
    const deltaCols = deltaX / viewModeConfig.columnWidth
    const deltaMs = deltaCols * viewModeConfig.step
    
    // Snap to grid
    const snappedDelta = Math.round(deltaMs / viewModeConfig.snapInterval) * viewModeConfig.snapInterval
    
    // Calculate new dates - preserve the original start date from dragStart
    const newStart = new Date(dragStart.date.getTime() + snappedDelta)
    
    // Calculate duration based on original activity dates
    const originalStart = new Date(activity.start).getTime()
    const originalEnd = activity.end ? new Date(activity.end).getTime() : originalStart + 3600000
    const duration = originalEnd - originalStart
    
    const newEnd = new Date(newStart.getTime() + duration)
    
    // Update activity
    onUpdate(activity.id, {
      start: newStart.toISOString(),
      end: newEnd.toISOString()
    })
  }, [isDragging, dragStart, activity, viewModeConfig, onUpdate])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setDragStart(null)
  }, [])
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])
  
  return {
    isDragging,
    handleMouseDown,
    handleTouchStart
  }
}
