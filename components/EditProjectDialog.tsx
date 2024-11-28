'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Project, useProjectStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, CalendarIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
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

type EditProjectDialogProps = {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormData = {
  name: string
  color: string
  startDate: Date
  endDate: Date
  tags: string
}

const predefinedColors = ['#ef4444', '#22c55e', '#3b82f6']

export default function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [customColor, setCustomColor] = useState(project.color)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const router = useRouter()
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: project.name,
      color: project.color,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      tags: project.tags.map(tag => tag.name).join(', ')
    },
  })

  const onSubmit = (data: FormData) => {
    const tags = data.tags.split(',').map(tag => ({
      id: crypto.randomUUID(),
      name: tag.trim()
    })).filter(tag => tag.name)

    const color = customColor || data.color
    updateProject(project.id, {
      name: data.name,
      color,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      tags,
      theme: {
        light: color,
        dark: color,
      },
    })
    onOpenChange(false)
  }

  const handleDeleteProject = () => {
    deleteProject(project.id)
    onOpenChange(false)
    router.push('/projects')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('startDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate') ? (
                      format(watch('startDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('startDate')}
                    onSelect={(date) => setValue('startDate', date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('endDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('endDate') ? (
                      format(watch('endDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('endDate')}
                    onSelect={(date) => setValue('endDate', date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Project Color</Label>
            <div className="flex gap-2 mt-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full border-2 relative',
                    watch('color') === color && 'border-black'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setValue('color', color)
                    setCustomColor('')
                  }}
                >
                  {watch('color') === color && (
                    <Check className="absolute inset-0 m-auto text-white h-4 w-4" />
                  )}
                </button>
              ))}
              <div className="relative">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value)
                    setValue('color', '')
                  }}
                  className="w-8 h-8 p-0"
                />
                {customColor && (
                  <Check className="absolute inset-0 m-auto text-white h-4 w-4 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="development, design, marketing"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and all of its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit">Update Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}