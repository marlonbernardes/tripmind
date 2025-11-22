'use client'

import { useMemo, useState } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { SimpleActivity } from '@/types/simple'

interface GanttChartProps {
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
}

const activityTypeColors = {
  flight: '#3B82F6',
  hotel: '#10B981', 
  event: '#8B5CF6',
  transport: '#F59E0B',
  note: '#6B7280',
  task: '#F97316'
}

export function GanttChart({ activities, selectedActivityId, onActivitySelect }: GanttChartProps) {
  // State for expanded/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['flight', 'transport', 'hotel', 'event', 'task', 'note']) // All expanded by default
  )

  // Helper function to safely parse date/time
  const safeParseDateTime = (dateStr: string, timeStr: string): Date => {
    try {
      // Remove timezone indicators from time string
      const cleanTime = timeStr.split('+')[0].split('-')[0]
      const dateTime = `${dateStr}T${cleanTime}`
      const date = new Date(dateTime)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date/time: ${dateTime}`)
        return new Date() // fallback to current date
      }
      
      return date
    } catch (error) {
      console.warn(`Error parsing date/time: ${dateStr}T${timeStr}`, error)
      return new Date() // fallback to current date
    }
  }

  // Toggle category expansion
  const toggleCategory = (categoryType: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryType)) {
        newSet.delete(categoryType)
      } else {
        newSet.add(categoryType)
      }
      return newSet
    })
  }

  // Group activities by type for hierarchical display
  const activitiesByType = useMemo(() => {
    const grouped = activities.reduce((acc, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = []
      }
      acc[activity.type].push(activity)
      return acc
    }, {} as Record<string, SimpleActivity[]>)
    
    // Sort by type priority and then by time within each type
    const typeOrder = ['flight', 'transport', 'hotel', 'event', 'task', 'note']
    return typeOrder
      .filter(type => grouped[type])
      .map(type => ({
        type,
        activities: grouped[type].sort((a, b) => {
          const dateA = safeParseDateTime(a.date, a.startTime)
          const dateB = safeParseDateTime(b.date, b.startTime)
          return dateA.getTime() - dateB.getTime()
        })
      }))
  }, [activities])

  // Convert activities to gantt-task-react format with project groups
  const ganttTasks = useMemo((): Task[] => {
    const tasks: Task[] = []
    
    activitiesByType.forEach(({ type, activities: typeActivities }) => {
      // Add parent task for the category
      const categoryStartTimes = typeActivities.map(a => safeParseDateTime(a.date, a.startTime).getTime())
      const categoryEndTimes = typeActivities.map(a => {
        const endTime = a.endTime ? safeParseDateTime(a.date, a.endTime).getTime() : safeParseDateTime(a.date, a.startTime).getTime() + (60 * 60 * 1000)
        return endTime
      })
      
      const categoryStart = new Date(Math.min(...categoryStartTimes))
      const categoryEnd = new Date(Math.max(...categoryEndTimes))
      const isExpanded = expandedCategories.has(type)
      
      tasks.push({
        start: categoryStart,
        end: categoryEnd,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
        id: `category-${type}`,
        type: 'project',
        progress: 0,
        isDisabled: true,
        hideChildren: !isExpanded,
        styles: {
          backgroundColor: activityTypeColors[type as keyof typeof activityTypeColors],
          backgroundSelectedColor: activityTypeColors[type as keyof typeof activityTypeColors],
          progressColor: activityTypeColors[type as keyof typeof activityTypeColors],
          progressSelectedColor: activityTypeColors[type as keyof typeof activityTypeColors]
        }
      })
      
      // Add child tasks for each activity in this category only if expanded
      if (isExpanded) {
        typeActivities.forEach((activity) => {
          const startTime = safeParseDateTime(activity.date, activity.startTime)
          let endTime = startTime
          
          if (activity.endTime) {
            endTime = safeParseDateTime(activity.date, activity.endTime)
            // Handle next-day activities (like flights with +1)
            if (activity.endTime.includes('+')) {
              endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000) // Add 24 hours
            }
          } else {
            // Default 1 hour duration for activities without end time
            endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
          }

          tasks.push({
            start: startTime,
            end: endTime,
            name: activity.title,
            id: activity.id,
            type: 'task',
            progress: 0,
            isDisabled: false,
            project: `category-${type}`,
            styles: {
              backgroundColor: activityTypeColors[activity.type],
              backgroundSelectedColor: activityTypeColors[activity.type],
              progressColor: activityTypeColors[activity.type],
              progressSelectedColor: activityTypeColors[activity.type]
            }
          })
        })
      }
    })
    
    return tasks
  }, [activitiesByType, expandedCategories])

  const handleTaskClick = (task: Task) => {
    const activity = activities.find(a => a.id === task.id)
    if (activity) {
      onActivitySelect?.(activity)
    }
  }

  const handleTaskChange = (task: Task) => {
    // For now, we don't allow editing tasks in the gantt chart
    console.log('Task change attempted:', task)
  }

  const handleTaskDelete = (task: Task) => {
    // For now, we don't allow deleting tasks from the gantt chart
    console.log('Task delete attempted:', task)
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No activities to display
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      {/* Gantt Chart */}
      <div className="gantt-wrapper" style={{ minHeight: '400px', overflow: 'auto' }}>
          <Gantt
            tasks={ganttTasks}
            viewMode={ViewMode.Day}
            onClick={handleTaskClick}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onProgressChange={handleTaskChange}
            listCellWidth="200px"
            columnWidth={60}
            ganttHeight={400}
            barCornerRadius={3}
            handleWidth={8}
            fontSize="14"
            fontFamily="system-ui, -apple-system, sans-serif"
            arrowColor="#999"
            arrowIndent={20}
            todayColor="rgba(252, 248, 227, 0.5)"
            TaskListHeader={({ headerHeight }) => (
              <div 
                className="flex items-center px-4 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600"
                style={{ height: headerHeight }}
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                  Activities
                </span>
              </div>
            )}
            TaskListTable={({ rowHeight, rowWidth, tasks, locale, onExpanderClick }) => (
              <div 
                className="border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                style={{ width: rowWidth }}
              >
                {tasks.map((task, index) => {
                  const activity = activities.find(a => a.id === task.id)
                  const isSelected = selectedActivityId === task.id
                  const isCategory = task.id.startsWith('category-')
                  const hasExpander = task.type === 'project'
                  const categoryType = isCategory ? task.id.replace('category-', '') : ''
                  const isExpanded = expandedCategories.has(categoryType)
                  
                  // Skip child tasks if their parent category is collapsed
                  if (!isCategory && task.project) {
                    const parentCategoryType = task.project.replace('category-', '')
                    if (!expandedCategories.has(parentCategoryType)) {
                      return null
                    }
                  }
                  
                  // Alternating row backgrounds - more subtle
                  const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'
                  
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center border-b border-gray-200 dark:border-gray-700 ${
                        isCategory 
                          ? `${rowBg} px-4 font-semibold` 
                          : `px-5 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/30 ${rowBg} ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`
                      }`}
                      style={{ height: rowHeight }}
                      onClick={() => !isCategory && handleTaskClick(task)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Expander for categories */}
                        {hasExpander && (
                          <button
                            className="w-4 h-4 flex-shrink-0 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleCategory(categoryType)
                            }}
                          >
                            <svg 
                              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                        
                        {/* Activity type indicator - smaller dots */}
                        {!isCategory && (
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: activityTypeColors[activity?.type || 'task'] }}
                          />
                        )}
                        
                        {/* Category icon for category rows - smaller squares */}
                        {isCategory && (
                          <div 
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: activityTypeColors[task.id.replace('category-', '') as keyof typeof activityTypeColors] }}
                          />
                        )}
                        
                        {/* Task/Category details */}
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm text-gray-800 dark:text-gray-200 truncate ${
                            isCategory ? 'font-semibold' : 'font-medium'
                          }`}>
                            {task.name}
                          </div>
                          {!isCategory && activity && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {activity?.type && (
                                <span className="capitalize">{activity.type}</span>
                              )}
                              {activity?.city && (
                                <span className="ml-2">• {activity.city}</span>
                              )}
                            </div>
                          )}
                          {isCategory && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {activitiesByType.find(t => `category-${t.type}` === task.id)?.activities.length || 0} items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }).filter(Boolean)}
              </div>
            )}
            TooltipContent={({ task }) => {
              const activity = activities.find(a => a.id === task.id)
              return (
                <div className="bg-gray-900 text-white p-2 rounded shadow-lg text-sm">
                  <div className="font-medium">{task.name}</div>
                  {activity && (
                    <>
                      <div className="text-gray-300 capitalize">{activity.type}</div>
                      <div className="text-gray-300">
                        {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                      </div>
                      {activity.city && (
                        <div className="text-gray-300">{activity.city}</div>
                      )}
                    </>
                  )}
                </div>
              )
            }}
          />
      </div>
      
      {/* Custom CSS for dark mode support */}
      <style jsx global>{`
        .dark .gantt-wrapper {
          filter: invert(1) hue-rotate(180deg);
        }
        
        .dark .gantt-wrapper .gantt-tooltip {
          filter: invert(1) hue-rotate(180deg);
        }
        
        /* Ensure text remains readable in dark mode */
        .dark .gantt-wrapper text {
          fill: white !important;
        }
        
        /* Fix for selected activity highlighting */
        .gantt-wrapper [data-task-id="${selectedActivityId || ''}"] {
          opacity: 1;
          stroke: #3B82F6;
          stroke-width: 2;
        }
      `}</style>
    </div>
  )
}
