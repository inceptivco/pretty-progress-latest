'use client'

import { useForm } from 'react-hook-form'
import { useProjectStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CreateFeatureDialogProps = {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormData = {
  name: string
}

export default function CreateFeatureDialog({
  projectId,
  open,
  onOpenChange,
}: CreateFeatureDialogProps) {
  const addFeature = useProjectStore((state) => state.addFeature)
  const { register, handleSubmit, reset } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    addFeature(projectId, {
      name: data.name,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Feature</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Feature Name</Label>
            <Input id="name" {...register('name', { required: true })} />
          </div>
          <Button type="submit" className="w-full">
            Create Feature
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}