import { AgentType } from '@/types'

// 存储键
export const STORAGE_KEYS = {
  PROJECTS: 'ai_pm_projects',
  AGENT_OUTPUTS: 'ai_pm_agent_outputs',
  USER: 'ai_pm_user',
  CONFIG: 'ai_pm_config',
} as const

// Agent执行顺序
export const AGENT_PIPELINE: AgentType[] = ['split', 'user_analysis', 'competitor', 'solution', 'prd']

// 本地存储清理天数
export const CLEANUP_DAYS = 30
