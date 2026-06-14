export type AgentType = 'split' | 'user_analysis' | 'competitor' | 'solution' | 'prd'

export interface AgentOutput {
  id: string
  projectId: string
  agentType: AgentType
  content: string
  timestamp: string
  isConfirmed: boolean
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'error'

export interface AgentExecution {
  agentType: AgentType
  status: AgentStatus
  output?: AgentOutput
  error?: string
}

export interface AgentConfig {
  mode: 'mock' | 'api'
  apiKey?: string
  apiProvider?: 'openai' | 'anthropic' | 'custom'
}

// Agent定义
export const AGENTS = [
  { type: 'split' as AgentType, name: '拆需求Agent', icon: '🔍' },
  { type: 'user_analysis' as AgentType, name: '分析用户Agent', icon: '👥' },
  { type: 'competitor' as AgentType, name: '分析竞品Agent', icon: '📊' },
  { type: 'solution' as AgentType, name: '输出方案Agent', icon: '💡' },
  { type: 'prd' as AgentType, name: '输出PRDAgent', icon: '📝' },
] as const
