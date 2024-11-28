'use client'

import { useState } from 'react'
import { Feature, Project, useProjectStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TaskList from '@/components/TaskList'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Copy, GripVertical, MoreVertical, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'

type FeatureListProps = {
  project: Project
}

type EditingFeature = {
  id: string
  name: string
} | null

export default function FeatureList({ project }: FeatureListProps) {
  const { duplicateFeature, deleteFeature, reorderFeatures, updateFeature } = useProjectStore()
  const [editingFeature, setEditingFeature] = useState<EditingFeature>(null)

  const handleDeleteFeature = (featureId: string) => {
    deleteFeature(project.id, featureId)
    toast.success('Feature deleted')
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const startIndex = result.source.index
    const endIndex = result.destination.index
    
    if (startIndex !== endIndex) {
      reorderFeatures(project.id, startIndex, endIndex)
    }
  }

  const handleFeatureNameClick = (feature: Feature) => {
    if (!project.isLocked) {
      setEditingFeature({ id: feature.id, name: feature.name })
    }
  }

  const handleFeatureNameSubmit = (featureId: string, name: string) => {
    updateFeature(project.id, featureId, { name })
    setEditingFeature(null)
  }

  const handleFeatureNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, featureId: string, name: string) => {
    if (e.key === 'Enter') {
      handleFeatureNameSubmit(featureId, name)
    } else if (e.key === 'Escape') {
      setEditingFeature(null)
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="features" direction="horizontal">
        {(provided) => (
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {project.features.map((feature, index) => {
              const completionPercentage =
                feature.tasks.length > 0
                  ? feature.tasks.reduce((acc, task) => acc + task.completion, 0) /
                    feature.tasks.length
                  : 0

              return (
                <Draggable 
                  key={feature.id} 
                  draggableId={feature.id} 
                  index={index}
                  isDragDisabled={project.isLocked}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`h-full ${snapshot.isDragging ? 'z-50' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging 
                          ? provided.draggableProps.style?.transform 
                          : 'none',
                      }}
                    >
                      <Card className="h-full flex flex-col">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center group">
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              {editingFeature?.id === feature.id ? (
                                <Input
                                  value={editingFeature.name}
                                  onChange={(e) => setEditingFeature({ ...editingFeature, name: e.target.value })}
                                  onBlur={() => handleFeatureNameSubmit(feature.id, editingFeature.name)}
                                  onKeyDown={(e) => handleFeatureNameKeyDown(e, feature.id, editingFeature.name)}
                                  className="h-7 py-0"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onClick={() => handleFeatureNameClick(feature)}
                                  className={project.isLocked ? '' : 'cursor-pointer hover:underline'}
                                >
                                  {feature.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {Math.round(completionPercentage)}%
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={project.isLocked}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => duplicateFeature(project.id, feature.id)}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this feature? This action cannot be undone.
                                          All tasks within this feature will be permanently deleted.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteFeature(feature.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete Feature
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardTitle>
                          <Progress 
                            value={completionPercentage} 
                            className="h-2"
                            style={{
                              '--progress-background': `color-mix(in srgb, ${project.color} 20%, transparent)`,
                              '--progress-foreground': project.color
                            } as React.CSSProperties}
                          />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="flex-1">
                            <TaskList projectId={project.id} feature={feature} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}