'use client'

import { useProjectStore } from '@/lib/store'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, LineChart, PieChart, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import ProjectProgress from '@/components/ProjectProgress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type VisualizationType = 'progress' | 'pie' | 'bar'

export default function ProjectReportPage() {
  const params = useParams()
  const router = useRouter()
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('progress')
  const [isWidescreen, setIsWidescreen] = useState(false)
  
  const project = useProjectStore((state) =>
    state.projects.find((p) => p.slug === params.slug)
  )

  if (!project) {
    return <div>Project not found</div>
  }

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

  const containerClass = isWidescreen 
    ? 'max-w-[1920px] mx-auto px-4'
    : 'container mx-auto'

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'pie':
        return (
          <div className="flex flex-col items-center p-4 md:p-8 space-y-6">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={project.color}
                  strokeWidth="10"
                  strokeDasharray={`${completedPercentage * 2.83} 283`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-2xl md:text-4xl font-bold">
                  {Math.round(completedPercentage)}%
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-2">
                  Overall Completion
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Project Duration: {format(startDate, 'PP')} - {format(endDate, 'PP')}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Features: {project.features.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Tasks: {totalTasks}
              </div>
            </div>
          </div>
        )
      case 'bar':
        const sortedFeatures = [...project.features].sort((a, b) => {
          const aCompletion = a.tasks.length > 0
            ? a.tasks.reduce((acc, task) => acc + task.completion, 0) / a.tasks.length
            : 0
          const bCompletion = b.tasks.length > 0
            ? b.tasks.reduce((acc, task) => acc + task.completion, 0) / b.tasks.length
            : 0
          return bCompletion - aCompletion
        })

        return (
          <div className="space-y-6 p-4 md:p-8">
            <div className="text-center space-y-2 mb-8">
              <div className="text-lg font-semibold">Feature Completion Breakdown</div>
              <div className="text-sm text-muted-foreground">
                Showing progress for {project.features.length} features
              </div>
            </div>
            <div className="space-y-6">
              {sortedFeatures.map((feature) => {
                const featureCompletion =
                  feature.tasks.length > 0
                    ? feature.tasks.reduce((acc, task) => acc + task.completion, 0) /
                      feature.tasks.length
                    : 0
                return (
                  <div key={feature.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{feature.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({feature.tasks.length} tasks)
                        </span>
                      </div>
                      <span className="font-medium ml-2">{Math.round(featureCompletion)}%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${featureCompletion}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      default:
        return <ProjectProgress project={project} />
    }
  }

  return (
    <div className={`py-4 md:py-8 ${containerClass}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:hidden gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${project.slug}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex flex-wrap gap-2">
          <Select value={visualizationType} onValueChange={(value: VisualizationType) => setVisualizationType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select visualization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">
                <div className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  Progress Line
                </div>
              </SelectItem>
              <SelectItem value="pie">
                <div className="flex items-center">
                  <PieChart className="mr-2 h-4 w-4" />
                  Pie Chart
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Bar Chart
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsWidescreen(!isWidescreen)}>
            {isWidescreen ? (
              <><Minimize2 className="mr-2 h-4 w-4" /> Standard View</>
            ) : (
              <><Maximize2 className="mr-2 h-4 w-4" /> Widescreen View</>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-4xl" style={{ color: project.color }}>
            {project.name} - Project Report
          </CardTitle>
          <div className="text-sm md:text-base text-muted-foreground">
            Generated on {format(new Date(), 'PPP')}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Start Date</div>
              <div className="text-base md:text-lg font-medium">{format(startDate, 'PPP')}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">End Date</div>
              <div className="text-base md:text-lg font-medium">{format(endDate, 'PPP')}</div>
            </div>
          </div>

          {renderVisualization()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8">
        {project.features.map((feature) => {
          const featureCompletion =
            feature.tasks.length > 0
              ? feature.tasks.reduce((acc, task) => acc + task.completion, 0) /
                feature.tasks.length
              : 0

          return (
            <Card key={feature.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-base md:text-lg">
                  <span className="truncate">{feature.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {Math.round(featureCompletion)}%
                  </span>
                </CardTitle>
                <Progress 
                  value={featureCompletion} 
                  className="h-2"
                  style={{
                    '--progress-background': `color-mix(in srgb, ${project.color} 20%, transparent)`,
                    '--progress-foreground': project.color
                  } as React.CSSProperties}
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feature.tasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-center">
                      <span className="truncate text-sm">{task.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {task.completion}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}