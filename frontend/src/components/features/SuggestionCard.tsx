'use client'

import type { Suggestion } from '@/types/simple'
import { Lightbulb, X } from 'lucide-react'
import { getActivityColor, getActivityIcon } from '@/lib/activity-config'

interface SuggestionCardProps {
  suggestion: Suggestion
  isSelected?: boolean
  onClick?: () => void
  onDismiss?: () => void
}

export function SuggestionCard({ suggestion, isSelected = false, onClick, onDismiss }: SuggestionCardProps) {
  // Reuse activity colors and icons from the config
  const color = getActivityColor(suggestion.type)
  const icon = getActivityIcon(suggestion.type)
  
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss?.()
  }

  return (
    <div 
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all cursor-pointer group ${
        isSelected 
          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' 
          : 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
      }`}
    >
      {/* Lightbulb icon */}
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {suggestion.title}
          </h3>
        </div>
        
        {suggestion.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {suggestion.description}
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
        title="Dismiss suggestion"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Suggestion badge */}
      <div className="absolute -top-2 left-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          SUGGESTION
        </span>
      </div>
    </div>
  )
}
