import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import slugify from 'slugify'

export type Tag = {
  id: string
  name: string
}

export type Task = {
  id: string
  name: string
  completion: number
}

export type Feature = {
  id: string
  name: string
  tasks: Task[]
}

export type Project = {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  color: string
  features: Feature[]
  tags: Tag[]
  isTemplate?: boolean
  isLocked?: boolean
  templateSaved?: boolean
}

type ProjectStore = {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'slug' | 'features' | 'tags'> & { tags?: Tag[], templateId?: string }) => Project
  updateProject: (projectId: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  addFeature: (projectId: string, feature: Omit<Feature, 'id' | 'tasks'>) => void
  duplicateFeature: (projectId: string, featureId: string) => void
  updateFeature: (projectId: string, featureId: string, feature: Partial<Feature>) => void
  deleteFeature: (projectId: string, featureId: string) => void
  addTask: (projectId: string, featureId: string, task: Omit<Task, 'id'>) => void
  updateTask: (projectId: string, featureId: string, taskId: string, task: Partial<Task>) => void
  deleteTask: (projectId: string, featureId: string, taskId: string) => void
  reorderTasks: (projectId: string, featureId: string, startIndex: number, endIndex: number) => void
  reorderFeatures: (projectId: string, startIndex: number, endIndex: number) => void
  saveAsTemplate: (projectId: string) => void
  getTemplates: () => Project[]
  toggleProjectLock: (projectId: string) => void
}

const deepCloneFeatures = (features: Feature[]): Feature[] => {
  return features.map(feature => ({
    ...feature,
    id: crypto.randomUUID(),
    tasks: feature.tasks.map(task => ({
      ...task,
      id: crypto.randomUUID(),
      completion: 0, // Reset completion to 0 for new projects
    })),
  }))
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) => {
        let newProject: Project | null = null;
        set((state) => {
          const projectExists = state.projects.some(
            (p) => p.name.toLowerCase() === project.name.toLowerCase()
          )
          if (projectExists) {
            throw new Error('Project with this name already exists')
          }

          let features: Feature[] = []
          let color = project.color
          if (project.templateId) {
            const template = state.projects.find(p => p.id === project.templateId)
            if (template) {
              features = deepCloneFeatures(template.features)
              color = template.color // Use template color if template is selected
            }
          }

          newProject = {
            ...project,
            id: crypto.randomUUID(),
            slug: slugify(project.name.toLowerCase()),
            features,
            color,
            tags: project.tags || [],
            isLocked: false,
            templateSaved: false
          }

          return {
            projects: [...state.projects, newProject],
          }
        })
        return newProject!;
      },
      updateProject: (projectId, project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked ? { ...p, ...project } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      addFeature: (projectId, feature) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: [
                    ...p.features,
                    { ...feature, id: crypto.randomUUID(), tasks: [] },
                  ],
                }
              : p
          ),
        })),
      duplicateFeature: (projectId, featureId) =>
        set((state) => {
          const project = state.projects.find(p => p.id === projectId);
          if (!project || project.isLocked) return state;

          const feature = project.features.find(f => f.id === featureId);
          if (!feature) return state;

          const duplicatedFeature: Feature = {
            ...feature,
            id: crypto.randomUUID(),
            name: `${feature.name} (Copy)`,
            tasks: feature.tasks.map(task => ({
              ...task,
              id: crypto.randomUUID()
            }))
          };

          return {
            projects: state.projects.map((p) =>
              p.id === projectId && !p.isLocked
                ? {
                    ...p,
                    features: [...p.features, duplicatedFeature],
                  }
                : p
            ),
          };
        }),
      updateFeature: (projectId, featureId, feature) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.map((f) =>
                    f.id === featureId ? { ...f, ...feature } : f
                  ),
                }
              : p
          ),
        })),
      deleteFeature: (projectId, featureId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.filter((f) => f.id !== featureId),
                }
              : p
          ),
        })),
      addTask: (projectId, featureId, task) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.map((f) =>
                    f.id === featureId
                      ? {
                          ...f,
                          tasks: [...f.tasks, { ...task, id: crypto.randomUUID() }],
                        }
                      : f
                  ),
                }
              : p
          ),
        })),
      updateTask: (projectId, featureId, taskId, task) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.map((f) =>
                    f.id === featureId
                      ? {
                          ...f,
                          tasks: f.tasks.map((t) =>
                            t.id === taskId ? { ...t, ...task } : t
                          ),
                        }
                      : f
                  ),
                }
              : p
          ),
        })),
      deleteTask: (projectId, featureId, taskId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.map((f) =>
                    f.id === featureId
                      ? {
                          ...f,
                          tasks: f.tasks.filter((t) => t.id !== taskId),
                        }
                      : f
                  ),
                }
              : p
          ),
        })),
      reorderTasks: (projectId, featureId, startIndex, endIndex) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: p.features.map((f) =>
                    f.id === featureId
                      ? {
                          ...f,
                          tasks: Array.from(f.tasks).sort((a, b) => {
                            if (a.id === f.tasks[startIndex].id) return endIndex - startIndex
                            if (b.id === f.tasks[startIndex].id) return startIndex - endIndex
                            return 0
                          }),
                        }
                      : f
                  ),
                }
              : p
          ),
        })),
      reorderFeatures: (projectId, startIndex, endIndex) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.isLocked
              ? {
                  ...p,
                  features: Array.from(p.features).sort((a, b) => {
                    if (a.id === p.features[startIndex].id) return endIndex - startIndex
                    if (b.id === p.features[startIndex].id) return startIndex - endIndex
                    return 0
                  }),
                }
              : p
          ),
        })),
      saveAsTemplate: (projectId) =>
        set((state) => ({
          projects: state.projects.map(p => 
            p.id === projectId 
              ? { ...p, templateSaved: true }
              : p
          )
        })),
      getTemplates: () => {
        return get().projects.filter(p => p.templateSaved);
      },
      toggleProjectLock: (projectId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, isLocked: !p.isLocked }
              : p
          ),
        })),
    }),
    {
      name: 'project-storage',
    }
  )
)