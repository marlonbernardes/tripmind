import type { SimpleActivity } from '@/types/simple'

export type ViewModeName = 'Hour' | 'Day' | 'Month'

export interface ViewModeConfig {
  name: ViewModeName
  step: number              // milliseconds per column
  columnWidth: number       // pixels
  padding: number           // days to pad before/after
  lowerFormat: string       // date-fns format for lower header
  upperFormat: string       // date-fns format for upper header
  snapInterval: number      // milliseconds to snap to when dragging
  showUpperWhen: (current: Date, previous?: Date) => boolean
}

export interface CustomGanttChartProps {
  activities: SimpleActivity[]
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
  onActivityUpdate?: (activityId: string, newDates: { start: string; end?: string }) => void
  leftPanelWidth?: number
}

export interface GroupedActivities {
  type: string
  activities: SimpleActivity[]
  allActivities: SimpleActivity[]
}

export interface GanttDates {
  ganttStart: Date
  ganttEnd: Date
  columns: Date[]
  firstColumnDate: Date
}

export interface GanttHeaderProps {
  columns: Date[]
  viewModeConfig: ViewModeConfig
}

export interface GanttLeftPanelProps {
  groupedActivities: GroupedActivities[]
  expandedCategories: Set<string>
  onToggleCategory: (type: string) => void
  selectedActivityId?: string
  onActivitySelect?: (activity: SimpleActivity) => void
}

export interface GanttGridProps {
  columns: Date[]
  groupedActivities: GroupedActivities[]
  viewModeConfig: ViewModeConfig
  ganttStart: Date
  selectedActivityId?: string
  onActivityUpdate?: (activityId: string, newDates: { start: string; end?: string }) => void
  onActivityHover?: (activity: SimpleActivity | null) => void
  onActivityClick?: (activity: SimpleActivity) => void
  activeActivity?: SimpleActivity | null
  containerRef?: HTMLDivElement | null
}

export interface GanttRowProps {
  activity: SimpleActivity
  ganttStart: Date
  viewModeConfig: ViewModeConfig
  rowIndex: number
  isSelected: boolean
  columns: Date[]
  onActivityUpdate?: (activityId: string, newDates: { start: string; end?: string }) => void
  onActivityHover?: (activity: SimpleActivity | null) => void
  onActivityClick?: (activity: SimpleActivity) => void
}

export interface GanttBarProps {
  activity: SimpleActivity
  x: number
  width: number
  isSelected: boolean
  onHover?: (activity: SimpleActivity | null) => void
  onClick?: (activity: SimpleActivity) => void
}
