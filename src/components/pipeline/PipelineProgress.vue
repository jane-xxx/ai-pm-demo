<template>
  <div class="pipeline-progress">
    <div class="progress-line">
      <ProgressNode
        v-for="(agentType, index) in agentTypes"
        :key="agentType"
        :agent-type="agentType"
        :status="getNodeStatus(agentType, index)"
        :is-current="isCurrentNode(index)"
        :has-output="hasAgentOutput(agentType)"
        :is-selected="selectedAgent === agentType"
        @click="handleNodeClick"
      />
    </div>
    <div class="progress-info">
      <!-- 移除执行状态文案 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { AGENTS, type AgentType, type AgentStatus } from '@/types'
import ProgressNode from './ProgressNode.vue'

const props = defineProps<{
  selectedAgent?: AgentType | null
}>()

const emit = defineEmits<{
  'select-agent': [agentType: AgentType]
}>()

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

function hasAgentOutput(agentType: AgentType): boolean {
  const execution = agentStore.executions.find(e => e.agentType === agentType)
  return !!execution?.output
}

function getAgentName(agentType: AgentType): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}

function handleNodeClick(agentType: AgentType) {
  emit('select-agent', agentType)
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
