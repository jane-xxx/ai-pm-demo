<template>
  <div class="agent-history">
    <h3 class="section-title">Agent执行历史</h3>

    <div class="history-list">
      <div
        v-for="execution in executions"
        :key="execution.agentType"
        class="history-item"
        :class="{ 'has-error': execution.status === 'error' }"
      >
        <div class="history-header">
          <span class="history-agent">{{ getAgentName(execution.agentType) }}</span>
          <span class="history-status" :class="execution.status">
            {{ getStatusText(execution.status) }}
          </span>
        </div>

        <div v-if="execution.output" class="history-content">
          <div class="history-time">{{ formatTime(execution.output.timestamp) }}</div>
          <div class="history-output" v-html="renderOutput(execution.output.content)"></div>
        </div>

        <div v-if="execution.error" class="history-error">
          错误: {{ execution.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS } from '@/types'
import { formatDate } from '@/utils/helpers'

const executions = computed(() => agentStore.executions)

function getAgentName(agentType: string): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '等待中'
    case 'running':
      return '执行中'
    case 'completed':
      return '已完成'
    case 'error':
      return '错误'
    default:
      return status
  }
}

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function renderOutput(content: string): string {
  return markdownService.render(content)
}
</script>

<style scoped>
.agent-history {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.history-item.has-error {
  border-color: rgba(239, 68, 68, 0.3);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.history-agent {
  font-weight: 600;
  color: #e2e8f0;
}

.history-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.history-status.pending {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.history-status.running {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.history-status.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.history-status.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.history-content {
  padding: 16px;
}

.history-time {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
}

.history-output {
  color: #e2e8f0;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

.history-error {
  padding: 16px;
  color: #ef4444;
  font-size: 14px;
}
</style>
