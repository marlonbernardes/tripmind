'use client'

import { useMemo, useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronRight, Calendar, Layers, ChevronsUpDown, Plus, List, Lightbulb, X } from 'lucide-react'
import { TripLayout } from '@/components/features/TripLayout'
import { TripSidePanel } from '@/components/features/TripSidePanel'
import { useTripContext } from '@/contexts/TripContext'
import type { Activity, ActivityType, Trip, Suggestion } from '@/types/simple'
import { getActivityColor, getActivityLabel, allActivityTypes } from '@/lib/activity-config'
import { expandActivitiesToDays, groupActivitiesByDay, formatShortDate, getDayOfWeek, getAllTripDays, groupSuggestionsByDay, groupSuggestionsByActivityType, mergeActivitiesAndSuggestions, type ExpandedActivity, type TimelineItem } from '@/lib/timeline-utils'
import { formatDayHeader, compareActivities } from '@/lib/date-service'

interface TimelinePageProps {
  params: Promise<{
    id: string;
  }>;
}

type GroupByMode = 'date' | 'type' | 'none'

// Condensed Activity Row Component
function CompactActivityRow({ 
  activity, 
  trip,
  displayDay,
  dayInfo,
  isSelected, 
  onClick,
  onDelete,
  showDate = false,
  showEndDate = false
}: { 
  activity: Activity
  trip: Trip
  displayDay?: number // For expanded activities, the specific day to show
  dayInfo?: { dayNumber: number; totalDays: number } // For multi-day indicators
  isSelected: boolean
  onClick: () => void
  onDelete?: () => void
  showDate?: boolean
  showEndDate?: boolean // Show end date/time column (for Type grouping)
}) {
  const activityColor = getActivityColor(activity.type)
  const startTime = activity.time ?? ''
  const currentDay = displayDay ?? activity.day
  const endDay = activity.endDay ?? activity.day
  const endTime = activity.endTime ?? ''
  
  // For multi-day activities in All/Date mode: show time only on first/last day
  const getDisplayTime = () => {
    if (!dayInfo) return startTime // Single-day activity, show time
    if (dayInfo.dayNumber === 1) return startTime // First day: show start time
    if (dayInfo.dayNumber === dayInfo.totalDays) return endTime || '–' // Last day: show end time
    return '–' // Middle days: show dash
  }
  
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${activity.status === 'draft' ? 'opacity-75' : ''}`}
    >
      {/* Color dot */}
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: activityColor }}
      />
      
      {/* Day of week and Date */}
      {showDate && (
        <>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 w-7 flex-shrink-0">
            {getDayOfWeek(trip, currentDay)}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-12 flex-shrink-0">
            {formatShortDate(trip, currentDay)}
          </span>
        </>
      )}
      
      {/* Time (context-aware for multi-day activities) */}
      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-10 flex-shrink-0">
        {getDisplayTime()}
      </span>
      
      {/* End Date/Time (for Type grouping) */}
      {showEndDate && endDay !== activity.day && (
        <>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">→</span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 w-7 flex-shrink-0">
            {getDayOfWeek(trip, endDay)}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-12 flex-shrink-0">
            {formatShortDate(trip, endDay)}
          </span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-10 flex-shrink-0">
            {endTime}
          </span>
        </>
      )}
      
      {/* Title with day indicator for multi-day activities */}
      <span className="text-xs text-gray-900 dark:text-white truncate flex-1">
        {activity.title}
        {dayInfo && (
          <span className="text-[9px] text-gray-400 dark:text-gray-500 ml-1">
            (Day {dayInfo.dayNumber}/{dayInfo.totalDays})
          </span>
        )}
      </span>
      
      {/* Status badge */}
      {activity.status === 'draft' && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
          DRAFT
        </span>
      )}
      
      {/* City and delete button container - maintains consistent end position */}
      <div className="flex items-center gap-0 group-hover:gap-1 flex-shrink-0 transition-all duration-150">
        {activity.city && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-20 group-hover:max-w-16 transition-all duration-150">
            {activity.city}
          </span>
        )}
        
        {/* Delete button - appears on hover */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 w-0 overflow-hidden group-hover:w-4 transition-all duration-150"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Compact Suggestion Row Component - styled like activity rows but with distinct background
function CompactSuggestionRow({ 
  suggestion, 
  trip,
  isSelected, 
  onClick,
  onDismiss
}: { 
  suggestion: Suggestion
  trip: Trip
  isSelected: boolean
  onClick: () => void
  onDismiss: () => void
}) {
  // Get city from context based on suggestion type
  const city = suggestion.context.type === 'stay' 
    ? suggestion.context.city 
    : suggestion.context.destinationCity
  
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-amber-100 dark:bg-amber-900/40' 
          : 'bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/30'
      }`}
    >
      {/* Lightbulb icon */}
      <Lightbulb 
        className="w-3 h-3 flex-shrink-0 text-amber-500"
      />
      
      {/* Title and Description */}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-900 dark:text-white truncate block">
          {suggestion.title}
        </span>
        {suggestion.description && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block">
            {suggestion.description}
          </span>
        )}
      </div>
      
      {/* SUGGESTION pill */}
      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-300 flex-shrink-0">
        SUGGESTION
      </span>
      
      {/* City and dismiss button container - maintains consistent end position */}
      <div className="flex items-center gap-0 group-hover:gap-1 flex-shrink-0 transition-all duration-150">
        {city && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-20 group-hover:max-w-16 transition-all duration-150">
            {city}
          </span>
        )}
        
        {/* Dismiss button - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 w-0 overflow-hidden group-hover:w-4 transition-all duration-150"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// Collapsible Section Component
function CollapsibleSection({ 
  groupKey,
  title,
  subtitle,
  activities,
  suggestions = [],
  trip,
  selectedActivityId,
  selectedSuggestionId,
  onActivitySelect,
  onActivityDelete,
  onSuggestionSelect,
  onSuggestionDismiss,
  isCollapsed,
  onToggleCollapse,
  onAddActivity,
  color,
  showDateInRows = false,
  showEndDateInRows = false
}: { 
  groupKey: string
  title: string
  subtitle?: string
  activities: Activity[]
  suggestions?: Suggestion[]
  trip: Trip
  selectedActivityId?: string
  selectedSuggestionId?: string
  onActivitySelect: (activity: Activity) => void
  onActivityDelete?: (activityId: string) => void
  onSuggestionSelect?: (suggestion: Suggestion) => void
  onSuggestionDismiss?: (id: string) => void
  isCollapsed: boolean
  onToggleCollapse: (key: string) => void
  onAddActivity: () => void
  color?: string
  showDateInRows?: boolean
  showEndDateInRows?: boolean
}) {
  // Sort activities by day and time
  const sortedActivities = [...activities].sort(compareActivities)

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Section Header */}
      <div
        onClick={() => onToggleCollapse(groupKey)}
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 sticky top-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleCollapse(groupKey)
          }
        }}
      >
        {/* Collapse indicator */}
        <div className="text-gray-400 dark:text-gray-500">
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </div>
        
        {/* Color indicator (for type grouping) */}
        {color && (
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        
        {/* Title */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
              • {subtitle}
            </span>
          )}
        </div>
        
        {/* Add Activity Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAddActivity()
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
      
      {/* Activities */}
      {!isCollapsed && (
        <div className="px-1 py-1">
          {/* Suggestions first - at the top of each group */}
          {suggestions.map((suggestion, index) => (
            <div key={suggestion.id}>
              {index > 0 && (
                <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 mx-2" />
              )}
              <CompactSuggestionRow
                suggestion={suggestion}
                trip={trip}
                isSelected={selectedSuggestionId === suggestion.id}
                onClick={() => onSuggestionSelect?.(suggestion)}
                onDismiss={() => onSuggestionDismiss?.(suggestion.id)}
              />
            </div>
          ))}
          
          {/* Divider between suggestions and activities */}
          {suggestions.length > 0 && sortedActivities.length > 0 && (
            <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 mx-2" />
          )}
          
          {/* Activities */}
          {sortedActivities.map((activity, index) => (
            <div key={activity.id}>
              {index > 0 && (
                <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 mx-2" />
              )}
              <CompactActivityRow
                activity={activity}
                trip={trip}
                isSelected={selectedActivityId === activity.id}
                onClick={() => onActivitySelect(activity)}
                onDelete={onActivityDelete ? () => onActivityDelete(activity.id) : undefined}
                showDate={showDateInRows}
                showEndDate={showEndDateInRows}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Timeline Toolbar Component
function TimelineToolbar({
  groupBy,
  onGroupByChange,
  allCollapsed,
  onToggleAll
}: {
  groupBy: GroupByMode
  onGroupByChange: (mode: GroupByMode) => void
  allCollapsed: boolean
  onToggleAll: () => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 mr-1">Group:</span>
        <button
          onClick={() => onGroupByChange('none')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            groupBy === 'none'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <List className="w-3 h-3" />
          All
        </button>
        <button
          onClick={() => onGroupByChange('date')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            groupBy === 'date'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-3 h-3" />
          Date
        </button>
        <button
          onClick={() => onGroupByChange('type')}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
            groupBy === 'type'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-3 h-3" />
          Type
        </button>
      </div>
      
      {groupBy !== 'none' && (
        <button
          onClick={onToggleAll}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <ChevronsUpDown className="w-3 h-3" />
          {allCollapsed ? 'Expand' : 'Collapse'}
        </button>
      )}
    </div>
  )
}

function TimelineContent() {
  const { 
    trip, 
    activities, 
    selectedActivity, 
    setSelectedActivity,
    deleteActivityWithUndo,
    suggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    dismissSuggestion
  } = useTripContext()
  const [groupBy, setGroupBy] = useState<GroupByMode>('date')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  
  // All activities expanded and sorted chronologically (for 'none' mode)
  const activitiesFlat = useMemo(() => {
    return expandActivitiesToDays(activities)
  }, [activities])
  
  // Group suggestions by day (for Date grouping)
  const suggestionsByDay = useMemo(() => {
    return groupSuggestionsByDay(suggestions)
  }, [suggestions])
  
  // Group suggestions by activity type (for Type grouping)
  const suggestionsByType = useMemo(() => {
    return groupSuggestionsByActivityType(suggestions)
  }, [suggestions])
  
  // Merged and sorted timeline items for All mode (flat list)
  const timelineItems = useMemo(() => {
    return mergeActivitiesAndSuggestions(activitiesFlat, suggestions)
  }, [activitiesFlat, suggestions])
  
  // Group activities by day
  const activitiesByDay = useMemo(() => {
    if (!trip) return []
    
    const grouped = groupActivitiesByDay(activities)
    const allDays = getAllTripDays(trip)
    
    return allDays
      .filter(day => grouped[day]?.length > 0)
      .map(day => {
        const dayActivities = grouped[day] || []
        const cities = [...new Set(dayActivities.filter(a => a.city).map(a => a.city))]
        
        return { 
          key: `day-${day}`,
          day,
          title: formatDayHeader(trip, day),
          subtitle: cities.join(', '),
          activities: dayActivities
        }
      })
  }, [activities, trip])
  
  // Group activities by type
  const activitiesByType = useMemo(() => {
    const grouped: Record<ActivityType, Activity[]> = {
      flight: [],
      stay: [],
      event: [],
      transport: []
    }
    
    activities.forEach(activity => {
      if (grouped[activity.type]) {
        grouped[activity.type].push(activity)
      }
    })
    
    // Return types that have activities OR suggestions
    return allActivityTypes
      .filter(type => grouped[type].length > 0 || suggestionsByType[type].length > 0)
      .map(type => ({
        key: type,
        title: getActivityLabel(type),
        color: getActivityColor(type),
        activities: grouped[type]
      }))
  }, [activities, suggestionsByType])
  
  // Get current groups based on groupBy mode
  const currentGroups = groupBy === 'date' ? activitiesByDay : groupBy === 'type' ? activitiesByType : []
  
  // Check if all groups are collapsed
  const allCollapsed = currentGroups.length > 0 && 
    currentGroups.every(group => collapsedGroups.has(group.key))
  
  // Toggle collapse for a single group
  const handleToggleCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }
  
  // Toggle all groups
  const handleToggleAll = () => {
    if (allCollapsed) {
      // Expand all
      setCollapsedGroups(new Set())
    } else {
      // Collapse all
      setCollapsedGroups(new Set(currentGroups.map(g => g.key)))
    }
  }
  
  // Handle group by change - reset collapsed state
  const handleGroupByChange = (mode: GroupByMode) => {
    setGroupBy(mode)
    setCollapsedGroups(new Set())
  }
  
  // Handle add activity - open create form
  const { setIsCreatingActivity } = useTripContext()
  const handleAddActivity = () => {
    setSelectedActivity(null)
    setIsCreatingActivity(true)
  }
  
  if (!trip) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left Panel - Timeline (60% on desktop, full width on mobile) */}
      <div className="w-full md:w-[60%] h-[50%] md:h-full flex flex-col bg-white dark:bg-gray-950 md:border-r border-b md:border-b-0 border-gray-200 dark:border-gray-800">
        {/* Toolbar */}
        <TimelineToolbar
          groupBy={groupBy}
          onGroupByChange={handleGroupByChange}
          allCollapsed={allCollapsed}
          onToggleAll={handleToggleAll}
        />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <div className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  No activities yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add your first activity to get started
                </p>
              </div>
            </div>
          ) : (
            <div>
              {groupBy === 'none' ? (
                // Flat list - merged activities and suggestions sorted by day
                <div className="px-1 py-1">
                  {timelineItems.map((item, index) => (
                    <div key={item.type === 'activity' ? `${item.item.id}-day-${item.item.displayDay}` : item.item.id}>
                      {index > 0 && (
                        <div className="h-px bg-gray-200/50 dark:bg-gray-700/50 mx-2" />
                      )}
                      {item.type === 'suggestion' ? (
                        <CompactSuggestionRow
                          suggestion={item.item}
                          trip={trip}
                          isSelected={selectedSuggestion?.id === item.item.id}
                          onClick={() => setSelectedSuggestion(item.item)}
                          onDismiss={() => dismissSuggestion(item.item.id)}
                        />
                      ) : (
                        <CompactActivityRow
                          activity={item.item}
                          trip={trip}
                          displayDay={item.item.displayDay}
                          dayInfo={item.item.dayNumber ? { dayNumber: item.item.dayNumber, totalDays: item.item.totalDays! } : undefined}
                          isSelected={selectedActivity?.id === item.item.id}
                          onClick={() => setSelectedActivity(item.item)}
                          onDelete={() => deleteActivityWithUndo(item.item.id)}
                          showDate
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : groupBy === 'date' ? (
                // Group by Date (Day)
                activitiesByDay.map((group) => (
                  <CollapsibleSection
                    key={group.key}
                    groupKey={group.key}
                    title={group.title}
                    subtitle={group.subtitle}
                    activities={group.activities}
                    suggestions={suggestionsByDay[group.day] || []}
                    trip={trip}
                    selectedActivityId={selectedActivity?.id}
                    selectedSuggestionId={selectedSuggestion?.id}
                    onActivitySelect={setSelectedActivity}
                    onActivityDelete={deleteActivityWithUndo}
                    onSuggestionSelect={setSelectedSuggestion}
                    onSuggestionDismiss={dismissSuggestion}
                    isCollapsed={collapsedGroups.has(group.key)}
                    onToggleCollapse={handleToggleCollapse}
                    onAddActivity={handleAddActivity}
                  />
                ))
              ) : (
                // Group by Type
                activitiesByType.map((group) => (
                  <CollapsibleSection
                    key={group.key}
                    groupKey={group.key}
                    title={group.title}
                    activities={group.activities}
                    suggestions={suggestionsByType[group.key as keyof typeof suggestionsByType] || []}
                    trip={trip}
                    selectedActivityId={selectedActivity?.id}
                    selectedSuggestionId={selectedSuggestion?.id}
                    onActivitySelect={setSelectedActivity}
                    onActivityDelete={deleteActivityWithUndo}
                    onSuggestionSelect={setSelectedSuggestion}
                    onSuggestionDismiss={dismissSuggestion}
                    isCollapsed={collapsedGroups.has(group.key)}
                    onToggleCollapse={handleToggleCollapse}
                    onAddActivity={handleAddActivity}
                    color={group.color}
                    showDateInRows
                    showEndDateInRows
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Details/Recommendations/AI Chat (40% on desktop, full width on mobile) */}
      <div className="w-full md:w-[40%] h-[50%] md:h-full">
        <TripSidePanel />
      </div>
    </div>
  )
}

export default function TimelinePage({ params }: TimelinePageProps) {
  const { id: tripId } = React.use(params)
  
  return (
    <TripLayout tripId={tripId} hideSidePanel>
      <TimelineContent />
    </TripLayout>
  )
}
