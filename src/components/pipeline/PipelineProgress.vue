<template>
  <div class="pipeline-progress">
    <div class="progress-line">
      <ProgressNode
        v-for="(agentType, index) in agentTypes"
        :key="agentType"
        :agent-type="agentType"
        :status="getNodeStatus(agentType, index)"
        :is-current="isCurrentNode(index)"
      />
    </div>
    <div class="progress-info">
      <span v-if="currentAgent" class="current-agent">
        正在执行: {{ getAgentName(currentAgent) }}
      </span>
      <span v-else class="progress-complete">
        🎉 管道执行完成
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { AGENTS, type AgentType, type AgentStatus } from '@/types'
import ProgressNode from './ProgressNode.vue'

const agentStore = agentStore
const agentTypes = computed(() => AGENTS.map(a => a.type))
const currentAgent = computed(() => agentStore.currentAgent)

function getNodeStatus(agentType: AgentType, index: number): AgentStatus {
  const execution = agentStore.executions.find(e => e.agentType === agentType)
  if (execution) {
    return execution.status
  }
  return index === 0 ? 'pending' : 'pending'
}

function isCurrentNode(index: number): boolean {
  return agentStore.executions[index]?.status === 'running'
}

function getAgentName(agentType: AgentType): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}
</script>

<style scoped>
.pipeline-progress {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.progress-line::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: linear-gradient(90deg, #1e293b, #334155);
  z-index: 0;
}

.progress-info {
  text-align: center;
  font-size: 14px;
}

.current-agent {
  color: #3b82f6;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.progress-complete {
  color: #10b981;
  font-weight: 600;
}
</style>
