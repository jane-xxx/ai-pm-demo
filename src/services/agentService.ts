import { AgentType, AgentOutput } from '@/types'
import { generateId } from '@/utils/helpers'
import { getMockOutput } from '@/utils/mockData'

class AgentService {
  private config: { mode: 'mock' | 'api'; apiKey?: string } = { mode: 'mock' }

  setConfig(config: { mode: 'mock' | 'api'; apiKey?: string }): void {
    this.config = config
  }

  // 执行Agent
  async executeAgent(
    agentType: AgentType,
    projectId: string,
    input: string,
    previousOutputs?: AgentOutput[]
  ): Promise<AgentOutput> {
    // 模拟延迟
    await this.delay(1500)

    let content: string

    if (this.config.mode === 'mock') {
      // Mock模式：使用预设模板
      content = getMockOutput(agentType, input)
    } else {
      // API模式：调用真实LLM
      content = await this.callLLMAPI(agentType, input, previousOutputs || [])
    }

    return {
      id: generateId(),
      projectId,
      agentType,
      content,
      timestamp: new Date().toISOString(),
      isConfirmed: false,
    }
  }

  // 调用LLM API
  private async callLLMAPI(
    agentType: AgentType,
    input: string,
    previousOutputs: AgentOutput[]
  ): Promise<string> {
    // 构建提示词
    const systemPrompt = this.getSystemPrompt(agentType)
    const userPrompt = this.buildUserPrompt(agentType, input, previousOutputs)

    // 真实API调用示例（当前未启用，需要配置有效API Key后取消注释）
    /*
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      })
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('API调用失败，回退到Mock模式:', error)
      return getMockOutput(agentType, input)
    }
    */

    // 当前返回Mock数据
    return getMockOutput(agentType, input)
  }

  private getSystemPrompt(agentType: AgentType): string {
    const prompts: Record<AgentType, string> = {
      split: '你是一个产品需求分析师，擅长将模糊的产品想法拆解为具体的功能需求。',
      user_analysis: '你是一个用户研究专家，擅长分析目标用户群体和用户画像。',
      competitor: '你是一个竞品分析专家，擅长分析市场竞争格局和差异化优势。',
      solution: '你是一个解决方案设计师，擅长将需求转化为具体的产品方案。',
      prd: '你是一个技术作家，擅长编写清晰、完整的产品需求文档（PRD）。'
    }
    return prompts[agentType]
  }

  private buildUserPrompt(agentType: AgentType, input: string, previousOutputs: AgentOutput[]): string {
    if (agentType === 'split') {
      return `请分析以下产品需求：\n${input}`
    }
    // 后续Agent基于前续输出
    const context = previousOutputs.map(o => o.content).join('\n\n')
    return `基于以下分析结果：\n${context}\n\n请完成${agentType}相关的分析。`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const agentService = new AgentService()
