import { reactive, computed } from 'vue'
import { AgentType, AgentExecution, AgentStatus, AgentOutput } from '@/types'
import { AGENT_PIPELINE } from '@/utils/constants'
import { agentService } from '@/services/agentService'
import { storageService } from '@/services/storageService'
import { projectStore } from './projectStore'

class AgentStore {
  private state = reactive({
    executions: [] as AgentExecution[],
    isExecuting: false,
    currentAgentIndex: 0,
  })

  get executions() {
    return this.state.executions
  }

  get isExecuting() {
    return this.state.isExecuting
  }

  get currentAgent() {
    if (this.state.currentAgentIndex < AGENT_PIPELINE.length) {
      return AGENT_PIPELINE[this.state.currentAgentIndex]
    }
    return null
  }

  get currentExecution() {
    if (this.currentAgent) {
      return this.state.executions.find(e => e.agentType === this.currentAgent)
    }
    return null
  }

  get hasMoreAgents() {
    return this.state.currentAgentIndex < AGENT_PIPELINE.length
  }

  get progress() {
    return {
      current: this.state.currentAgentIndex,
      total: AGENT_PIPELINE.length,
      completed: this.state.executions.filter(e => e.status === 'completed').length,
    }
  }

  // 初始化管道
  initPipeline(projectId: string): void {
    this.state.executions = AGENT_PIPELINE.map(agentType => ({
      agentType,
      status: 'pending' as AgentStatus,
    }))
    this.state.currentAgentIndex = 0
  }

  // 执行当前Agent
  async executeCurrent(projectId: string, input: string): Promise<AgentOutput | null> {
    const agent = this.currentAgent
    if (!agent) return null

    const execution = this.state.executions.find(e => e.agentType === agent)
    if (!execution) return null

    this.state.isExecuting = true
    execution.status = 'running'

    try {
      // 获取之前的输出
      const previousOutputs = this.state.executions
        .filter(e => e.status === 'completed' && e.output)
        .map(e => e.output!)

      // 执行Agent
      const output = await agentService.executeAgent(agent, projectId, input, previousOutputs)

      execution.status = 'completed'
      execution.output = output

      // 保存到存储
      storageService.saveAgentOutput(output)

      // 更新项目进度
      const project = projectStore.currentProject
      if (project) {
        project.currentStep = this.state.currentAgentIndex + 1
        project.status = 'in_progress'
        projectStore.updateProject(project)
      }

      return output
    } catch (error) {
      execution.status = 'error'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      return null
    } finally {
      this.state.isExecuting = false
    }
  }

  // 确认当前Agent输出，进入下一步
  confirmCurrent(): void {
    if (!this.currentExecution?.output) return

    this.currentExecution.output.isConfirmed = true
    storageService.saveAgentOutput(this.currentExecution.output)

    this.state.currentAgentIndex++
  }

  // 跳过当前Agent
  skipCurrent(): void {
    this.state.currentAgentIndex++
  }

  // 重试当前Agent
  async retryCurrent(projectId: string, input: string): Promise<AgentOutput | null> {
    const execution = this.currentExecution
    if (!execution) return null

    // 重置状态
    execution.status = 'pending'
    execution.error = undefined
    execution.output = undefined

    return this.executeCurrent(projectId, input)
  }

  // 完成管道
  completePipeline(prdContent: string): void {
    const project = projectStore.currentProject
    if (!project) return

    project.status = 'completed'
    project.prdContent = prdContent
    projectStore.updateProject(project)
  }

  // 加载项目的历史输出
  loadAgentOutputs(projectId: string): void {
    const outputs = storageService.getAgentOutputs(projectId)
    this.state.executions = AGENT_PIPELINE.map(agentType => {
      const output = outputs.find(o => o.agentType === agentType)
      return {
        agentType,
        status: output ? 'completed' : 'pending',
        output,
      }
    })

    // 找到第一个未完成的Agent
    const firstIncomplete = this.state.executions.findIndex(e => e.status !== 'completed')
    this.state.currentAgentIndex = firstIncomplete >= 0 ? firstIncomplete : AGENT_PIPELINE.length
  }
}

export const agentStore = new AgentStore()
