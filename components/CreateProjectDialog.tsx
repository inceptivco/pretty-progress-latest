'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useProjectStore, Project } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type CreateProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormData = {
  name: string
  startDate: Date
  endDate: Date
  color: string
  tags: string
  templateId?: string
}

const predefinedColors = ['#000000', '#ef4444', '#22c55e', '#3b82f6']

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [customColor, setCustomColor] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const addProject = useProjectStore((state) => state.addProject)
  const templates = useProjectStore((state) => state.getTemplates())
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>()

  // Update color when template changes
  useEffect(() => {
    const templateId = watch('templateId')
    if (templateId) {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        setValue('color', template.color)
        setCustomColor('')
      }
    }
  }, [watch('templateId'), templates, setValue])

  const onSubmit = (data: FormData) => {
    try {
      const tags = data.tags.split(',').map(tag => ({
        id: crypto.randomUUID(),
        name: tag.trim()
      })).filter(tag => tag.name)

      const color = customColor || data.color

      const project = addProject({
        name: data.name,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        color,
        templateId: data.templateId,
        tags,
      })

      reset()
      onOpenChange(false)
      router.push(`/projects/${project.slug}`)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Press <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-muted rounded">N</kbd> to create a new project anytime
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              className={cn(errors.name && 'border-red-500')}
            />
          </div>

          {templates.length > 0 && (
            <div>
              <Label>Template (Optional)</Label>
              <Select onValueChange={(value) => setValue('templateId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                    watch('color') === color && 'border-black dark:border-white'
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

          <Button type="submit" className="w-full">
            Create Project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}