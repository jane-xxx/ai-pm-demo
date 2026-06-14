import { Project, AgentOutput, User, AgentConfig } from '@/types'
import { STORAGE_KEYS, CLEANUP_DAYS } from '@/utils/constants'
import { isExpired } from '@/utils/helpers'

class StorageService {
  // 项目操作
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    if (!data) return []
    const projects = JSON.parse(data) as Project[]
    // 清理过期草稿
    return projects.filter(p => {
      if (p.status === 'completed') return true
      return !isExpired(CLEANUP_DAYS, p.createdAt)
    })
  }

  saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects()
    return projects.find(p => p.id === id) || null
  }

  saveProject(project: Project): void {
    const projects = this.getProjects()
    const index = projects.findIndex(p => p.id === project.id)
    if (index >= 0) {
      projects[index] = project
    } else {
      projects.push(project)
    }
    this.saveProjects(projects)
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id)
    this.saveProjects(projects)
  }

  // Agent输出操作
  getAgentOutputs(projectId: string): AgentOutput[] {
    const data = localStorage.getItem(STORAGE_KEYS.AGENT_OUTPUTS)
    if (!data) return []
    const all = JSON.parse(data) as Record<string, AgentOutput[]>
    return all[projectId] || []
  }

  saveAgentOutput(output: AgentOutput): void {
    const data = localStorage.getItem(STORAGE_KEYS.AGENT_OUTPUTS)
    const all: Record<string, AgentOutput[]> = data ? JSON.parse(data) : {}
    if (!all[output.projectId]) {
      all[output.projectId] = []
    }
    const index = all[output.projectId].findIndex(o => o.id === output.id)
    if (index >= 0) {
      all[output.projectId][index] = output
    } else {
      all[output.projectId].push(output)
    }
    localStorage.setItem(STORAGE_KEYS.AGENT_OUTPUTS, JSON.stringify(all))
  }

  // 用户操作
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  }

  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  // 配置操作
  getConfig(): AgentConfig {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG)
    return data ? JSON.parse(data) : { mode: 'mock' }
  }

  saveConfig(config: AgentConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }
}

export const storageService = new StorageService()
