export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  currentStep: number
  status: ProjectStatus
  prdContent?: string
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed'

export interface ProjectCreateInput {
  name: string
  description: string
}
