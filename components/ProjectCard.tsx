import { Project, useProjectStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { Lock, Trash2 } from 'lucide-react'

type ProjectCardProps = {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const deleteProject = useProjectStore((state) => state.deleteProject)

  return (
    <Card className="relative border-border">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            <span>{project.name}</span>
            {project.isLocked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => deleteProject(project.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div>Start: {format(new Date(project.startDate), 'PP')}</div>
            <div>End: {format(new Date(project.endDate), 'PP')}</div>
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.slug}`} className="w-full">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}