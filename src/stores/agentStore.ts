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
    viewingAgent: null as AgentType | null, // 用于查看历史输出，但不影响执行流程
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

  get viewingAgent() {
    return this.state.viewingAgent
  }

  // 获取当前应该显示的执行结果
  // 优先显示正在运行的，其次显示查看的历史，然后显示当前agent
  // 最后如果 pipeline 完成，显示已完成的 PRD
  get displayExecution() {
    const running = this.state.executions.find(e => e.status === 'running')
    if (running) return running

    if (this.state.viewingAgent) {
      return this.state.executions.find(e => e.agentType === this.state.viewingAgent)
    }

    // 如果当前 agent 为 null（pipeline 已完成），返回 PRD execution
    if (!this.currentAgent) {
      const prdExecution = this.state.executions.find(e => e.agentType === 'prd')
      if (prdExecution?.output?.isConfirmed) {
        return prdExecution
      }
    }

    return this.currentExecution
  }

  // 检查某个agent是否已完成（可点击查看）
  canViewAgent(agentType: AgentType): boolean {
    const execution = this.state.executions.find(e => e.agentType === agentType)
    return execution?.status === 'completed'
  }

  // 设置查看历史agent
  setViewingAgent(agentType: AgentType | null): void {
    if (agentType && this.canViewAgent(agentType)) {
      this.state.viewingAgent = agentType
    } else {
      this.state.viewingAgent = null
    }
  }

  // 重置查看状态（回到当前agent）
  resetViewingAgent(): void {
    this.state.viewingAgent = null
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
    console.log('executeCurrent 开始:', { agent, currentAgentIndex: this.state.currentAgentIndex })
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

      // 如果是 PRD agent，自动确认输出
      if (agent === 'prd' && output.content) {
        output.isConfirmed = true
        storageService.saveAgentOutput(output)
        console.log('✅ PRD 输出已自动确认')

        // 保存 PRD 内容到项目
        console.log('🎯 PRD agent 执行完成，开始保存...', { projectId, contentLength: output.content.length })
        // 从所有项目中找到目标项目并更新
        const targetProject = projectStore.projects.find(p => p.id === projectId)
        if (targetProject) {
          targetProject.prdContent = output.content
          targetProject.status = 'completed'
          projectStore.updateProject(targetProject)
          // 同时直接更新存储，确保数据同步
          storageService.saveProject(targetProject)
          console.log('✅ PRD 自动保存成功:', targetProject.name, 'PRD长度:', targetProject.prdContent?.length)
        } else {
          console.error('❌ 找不到项目:', projectId, '可用项目:', projectStore.projects.map(p => p.id))
        }

        // PRD 完成后递增 index，标志 pipeline 完成
        this.state.currentAgentIndex++
        console.log('✅ Pipeline 已完成，currentAgentIndex 递增为:', this.state.currentAgentIndex)
      }

      // 更新项目进度
      const project = projectStore.currentProject
      if (project) {
        project.currentStep = this.state.currentAgentIndex + 1
        // 如果不是最后一个 agent，状态为 in_progress；如果是 PRD 且已确认，状态为 completed
        if (agent === 'prd' && output.isConfirmed) {
          project.status = 'completed'
        } else {
          project.status = 'in_progress'
        }
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

    // 对于 PRD，保留之前的输出，只重置 isConfirmed 状态
    if (execution.agentType === 'prd' && execution.output?.content) {
      execution.output.isConfirmed = false
      storageService.saveAgentOutput(execution.output)
      // 仍然执行生成，会更新 content
    } else {
      // 其他 agent，完全重置状态
      execution.status = 'pending'
      execution.error = undefined
      execution.output = undefined
    }

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

    // 找到第一个未完成（未确认）的Agent
    // 判断条件：状态不是 completed，或者输出存在但未确认
    const firstIncomplete = this.state.executions.findIndex(e =>
      e.status !== 'completed' || (e.output && !e.output.isConfirmed)
    )
    this.state.currentAgentIndex = firstIncomplete >= 0 ? firstIncomplete : AGENT_PIPELINE.length
  }
}

export const agentStore = new AgentStore()
