import { reactive, computed } from 'vue'
import { Project, ProjectCreateInput, ProjectStatus } from '@/types'
import { storageService } from '@/services/storageService'
import { generateId } from '@/utils/helpers'

class ProjectStore {
  private state = reactive({
    projects: [] as Project[],
    currentProject: null as Project | null,
  })

  constructor() {
    this.loadProjects()
  }

  get projects() {
    return this.state.projects
  }

  get currentProject() {
    return this.state.currentProject
  }

  get hasCurrentProject() {
    return this.state.currentProject !== null
  }

  private loadProjects(): void {
    this.state.projects = storageService.getProjects()
  }

  createProject(input: ProjectCreateInput): Project {
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      currentStep: 0,
      status: 'draft' as ProjectStatus,
    }
    this.state.projects.unshift(project)
    storageService.saveProjects(this.state.projects)
    return project
  }

  setCurrentProject(project: Project | null): void {
    this.state.currentProject = project
  }

  updateProject(project: Project): void {
    const index = this.state.projects.findIndex(p => p.id === project.id)
    if (index >= 0) {
      this.state.projects[index] = project
    }
    if (this.state.currentProject?.id === project.id) {
      this.state.currentProject = project
    }
    storageService.saveProjects(this.state.projects)
  }

  deleteProject(id: string): void {
    this.state.projects = this.state.projects.filter(p => p.id !== id)
    if (this.state.currentProject?.id === id) {
      this.state.currentProject = null
    }
    storageService.saveProjects(this.state.projects)
  }
}

export const projectStore = new ProjectStore()
