'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useProjectStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Search } from 'lucide-react'
import ProjectCard from '@/components/ProjectCard'
import CreateProjectDialog from '@/components/CreateProjectDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const projects = useProjectStore((state) => state.projects)

  const regularProjects = projects.filter(project => !project.templateSaved)
  const templateProjects = projects.filter(project => project.templateSaved)

  const filterProjects = (projectList: typeof projects) => {
    const searchLower = searchTerm.toLowerCase()
    return projectList.filter(project => {
      return project.name.toLowerCase().includes(searchLower) ||
             project.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
    })
  }

  const filteredProjects = filterProjects(regularProjects)
  const filteredTemplates = filterProjects(templateProjects)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        setIsCreateOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderProjectGrid = (projects: typeof filteredProjects) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )

  const renderEmptyState = (type: 'projects' | 'templates') => (
    <div className="text-center py-8 md:py-12">
      <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground mb-2">
        No {type} found
      </h2>
      <p className="text-sm md:text-base text-muted-foreground mb-4">
        {searchTerm ? 
          `We couldn't find any ${type} matching your search.` :
          type === 'projects' ? 
            "Start by creating your first project." :
            "Save a project as a template to see it here."
        }
      </p>
      {type === 'projects' && (
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-4 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="projects" className="flex-1 sm:flex-none">Projects</TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 sm:flex-none">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {filteredProjects.length === 0 
            ? renderEmptyState('projects')
            : renderProjectGrid(filteredProjects)
          }
        </TabsContent>

        <TabsContent value="templates">
          {filteredTemplates.length === 0
            ? renderEmptyState('templates')
            : renderProjectGrid(filteredTemplates)
          }
        </TabsContent>
      </Tabs>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}