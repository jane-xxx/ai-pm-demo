<template>
  <div
    class="progress-node"
    :class="[`status-${status}`, { 'is-current': isCurrent }]"
  >
    <div class="node-icon">{{ icon }}</div>
    <div class="node-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AGENTS, type AgentType, type AgentStatus } from '@/types'

const props = defineProps<{
  agentType: AgentType
  status: AgentStatus
  isCurrent: boolean
}>()

const agent = computed(() => AGENTS.find(a => a.type === props.agentType))
const icon = computed(() => agent.value?.icon || '⚪')
const label = computed(() => agent.value?.name || props.agentType)
</script>

<style scoped>
.progress-node {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #1e293b;
  border: 2px solid #64748b;
  transition: all 0.3s;
}

.progress-node.status-pending .node-icon {
  border-color: #64748b;
  background: #1e293b;
}

.progress-node.status-running .node-icon {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.progress-node.status-completed .node-icon {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.progress-node.status-error .node-icon {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  animation: error-pulse 1s ease-in-out infinite;
}

.progress-node.is-current .node-icon {
  transform: scale(1.1);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
  }
}

@keyframes error-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.node-label {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  max-width: 80px;
}

.progress-node.status-completed .node-label {
  color: #10b981;
}

.progress-node.status-running .node-label {
  color: #3b82f6;
  font-weight: 500;
}
</style>
