<template>
  <div class="agent-output">
    <div v-if="currentExecution && currentExecution.output" class="output-content">
      <div class="output-header">
        <h3 class="output-title">
          {{ getAgentName(currentExecution.agentType) }} 输出
        </h3>
        <span class="output-time">{{ formatTime(currentExecution.output.timestamp) }}</span>
      </div>

      <div class="output-body" v-html="renderedContent"></div>
    </div>

    <div v-else-if="currentExecution && currentExecution.status === 'running'" class="output-loading">
      <div class="loading-spinner"></div>
      <p>正在分析...</p>
    </div>

    <div v-else class="output-empty">
      <div class="empty-icon">📝</div>
      <p>等待执行...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS } from '@/types'
import { formatDate } from '@/utils/helpers'

const agentStore = agentStore
const currentExecution = computed(() => agentStore.currentExecution)

const renderedContent = computed(() => {
  if (currentExecution.value?.output) {
    return markdownService.render(currentExecution.value.output.content)
  }
  return ''
})

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function getAgentName(agentType: string): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}
</script>

<style scoped>
.agent-output {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.output-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.output-time {
  font-size: 12px;
  color: #64748b;
}

.output-body {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
  color: #e2e8f0;
  line-height: 1.7;
}

.output-body::-webkit-scrollbar {
  width: 6px;
}

.output-body::-webkit-scrollbar-track {
  background: #1e293b;
}

.output-body::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

.output-body :deep(h1),
.output-body :deep(h2),
.output-body :deep(h3) {
  color: #3b82f6;
  margin-top: 24px;
  margin-bottom: 12px;
}

.output-body :deep(p) {
  margin-bottom: 12px;
}

.output-body :deep(ul),
.output-body :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
}

.output-body :deep(code) {
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.output-body :deep(pre) {
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.output-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.output-body :deep(th),
.output-body :deep(td) {
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  text-align: left;
}

.output-body :deep(th) {
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
