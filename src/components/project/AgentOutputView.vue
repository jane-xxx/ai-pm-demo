<template>
  <div class="agent-output-view">
    <div class="output-header">
      <h3 class="output-title">
        {{ getAgentName(agentType) }}
      </h3>
      <span class="output-time" v-if="outputTime">
        {{ outputTime }}
      </span>
    </div>

    <div v-if="execution && execution.output && execution.output.content" class="output-content" v-html="renderedContent"></div>

    <div v-else-if="execution && execution.status === 'running'" class="output-loading">
      <div class="loading-spinner"></div>
      <p>正在分析...</p>
    </div>

    <div v-else-if="execution && execution.status === 'pending'" class="output-empty">
      <div class="empty-icon">⏳</div>
      <p>等待执行...</p>
    </div>

    <div v-else class="output-empty">
      <div class="empty-icon">📭</div>
      <p>暂无输出内容</p>
      <p class="empty-hint">请先在新建项目中完成 Pipeline 执行</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { projectStore } from '@/stores/projectStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS, type AgentType } from '@/types'
import { formatDate } from '@/utils/helpers'

const props = defineProps<{
  agentType: AgentType
  projectId: string
}>()

const execution = computed(() => {
  return agentStore.executions.find(e => e.agentType === props.agentType)
})

const renderedContent = computed(() => {
  console.log('AgentOutputView renderedContent 计算:', {
    agentType: props.agentType,
    hasExecutionOutput: !!execution.value?.output?.content,
    hasProjectPrd: props.agentType === 'prd' && !!projectStore.projects.find(p => p.id === props.projectId)?.prdContent
  })

  // 优先从 execution.output 获取
  if (execution.value?.output?.content) {
    console.log('从 execution.output 加载')
    return markdownService.render(execution.value.output.content)
  }

  // 如果是 PRD agent，尝试从项目获取
  if (props.agentType === 'prd') {
    const project = projectStore.projects.find(p => p.id === props.projectId)
    if (project?.prdContent) {
      console.log('从 project.prdContent 加载')
      return markdownService.render(project.prdContent)
    }
  }

  console.log('没有找到内容')
  return ''
})

const hasContent = computed(() => {
  return !!renderedContent.value
})

const outputTime = computed(() => {
  if (execution.value?.output?.timestamp) {
    return formatDate(execution.value.output.timestamp)
  }
  // 如果是 PRD 从项目获取，使用项目更新时间
  const project = projectStore.projects.find(p => p.id === props.projectId)
  if (project?.prdContent) {
    return formatDate(project.createdAt)
  }
  return ''
})

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function getAgentName(agentType: AgentType): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}
</script>

<style scoped>
.agent-output-view {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
  /* 移除 margin-top，外层容器已处理间距 */
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.output-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.output-time {
  font-size: 12px;
  color: #64748b;
}

.output-content {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;
  color: #e2e8f0;
  line-height: 1.7;
}

.output-content::-webkit-scrollbar {
  width: 6px;
}

.output-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.output-content::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

.output-content :deep(h1),
.output-content :deep(h2),
.output-content :deep(h3) {
  color: #3b82f6;
  margin-top: 24px;
  margin-bottom: 12px;
}

.output-content :deep(p) {
  margin-bottom: 12px;
}

.output-content :deep(ul),
.output-content :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
}

.output-content :deep(code) {
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.output-content :deep(pre) {
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.output-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.output-content :deep(th),
.output-content :deep(td) {
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  text-align: left;
}

.output-content :deep(th) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.output-loading,
.output-empty {
  padding: 60px 24px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.output-loading p {
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.output-empty p {
  color: #64748b;
}
</style>
