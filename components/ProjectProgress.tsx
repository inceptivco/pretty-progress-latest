'use client'

import { Project } from '@/lib/store'
import { Progress } from '@/components/ui/progress'
import { format, differenceInDays } from 'date-fns'

type ProjectProgressProps = {
  project: Project
  showTimeIndicator?: boolean
}

export default function ProjectProgress({ project, showTimeIndicator = true }: ProjectProgressProps) {
  const totalTasks = project.features.reduce(
    (acc, feature) => acc + feature.tasks.length,
    0
  )

  const completedPercentage = totalTasks
    ? project.features.reduce(
        (acc, feature) =>
          acc +
          feature.tasks.reduce((sum, task) => sum + task.completion, 0) /
            totalTasks,
        0
      )
    : 0

  const startDate = new Date(project.startDate)
  const endDate = new Date(project.endDate)
  const today = new Date()

  const totalDays = differenceInDays(endDate, startDate)
  const daysElapsed = differenceInDays(today, startDate)
  const timeProgress = Math.max(
    0,
    Math.min(100, (daysElapsed / totalDays) * 100)
  )

  return (
    <div className="space-y-8 mt-12">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Overall Progress</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {Math.round(completedPercentage)}% Complete
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(timeProgress)}% Time Elapsed
          </span>
        </div>
      </div>
      <div className="relative">
        <Progress
          value={completedPercentage}
          className="h-2"
          style={{
            '--progress-background': `color-mix(in srgb, ${project.color} 20%, transparent)`,
            '--progress-foreground': project.color
          } as React.CSSProperties}
        />
        {showTimeIndicator && (
          <div className="absolute" style={{ left: `${timeProgress}%`, top: '-24px' }}>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 border-8 border-transparent border-t-popover" style={{ top: '100%' }} />
              <div className="bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 whitespace-nowrap">
                Today - {format(today, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="w-0.5 h-4 bg-foreground mx-auto mt-1" />
          </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(startDate, 'PP')}</span>
        <span>{format(endDate, 'PP')}</span>
      </div>
    </div>
  )
}