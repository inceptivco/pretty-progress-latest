'use client'

import { useProjectStore } from '@/lib/store'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Sun, Moon, ArrowLeft, Settings, Save, Lock, Unlock } from 'lucide-react'
import { useState, useEffect } from 'react'
import FeatureList from '@/components/FeatureList'
import ProjectProgress from '@/components/ProjectProgress'
import CreateFeatureDialog from '@/components/CreateFeatureDialog'
import EditProjectDialog from '@/components/EditProjectDialog'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const saveAsTemplate = useProjectStore((state) => state.saveAsTemplate)
  const toggleProjectLock = useProjectStore((state) => state.toggleProjectLock)
  
  const project = useProjectStore((state) =>
    state.projects.find((p) => p.slug === params.slug)
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setIsCreateOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!project) {
    return <div>Project not found</div>
  }

  const handleSaveAsTemplate = () => {
    saveAsTemplate(project.id)
    toast.success('Project saved as template')
  }

  const handleToggleLock = () => {
    toggleProjectLock(project.id)
    toast.success(project.isLocked ? 'Project unlocked' : 'Project locked')
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/projects')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: project.color }}>
          {project.name}
          {project.isLocked && (
            <Lock className="inline-block ml-2 h-5 w-5 text-muted-foreground" />
          )}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleThemeToggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={handleToggleLock}>
            {project.isLocked ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {project.isLocked ? 'Unlock Project' : 'Lock Project'}
          </Button>
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push(`/projects/${project.slug}/report`)}>
            <FileText className="h-4 w-4" />
          </Button>
          {!project.templateSaved && (
            <Button variant="outline" onClick={handleSaveAsTemplate}>
              <Save className="h-4 w-4" />
              Save as Template
            </Button>
          )}
          <Button 
            onClick={() => setIsCreateOpen(true)}
            disabled={project.isLocked}
            style={{ 
              backgroundColor: project.color,
              '--hover-color': `color-mix(in srgb, ${project.color} 90%, black)`
            } as React.CSSProperties}
            className="hover:bg-[var(--hover-color)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Feature (Ctrl+F)
          </Button>
        </div>
      </div>

      <ProjectProgress project={project} />
      
      <div className="mt-8">
        <FeatureList project={project} />
      </div>

      <CreateFeatureDialog
        projectId={project.id}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditProjectDialog
        project={project}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  )
}