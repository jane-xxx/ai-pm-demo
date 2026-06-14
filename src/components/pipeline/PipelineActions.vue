<template>
  <div class="pipeline-actions">
    <button
      v-if="canExecute"
      class="btn-action btn-primary"
      :disabled="isExecuting"
      @click="handleExecute"
    >
      {{ isExecuting ? '执行中...' : (hasOutput ? '重新执行' : '开始执行') }}
    </button>

    <template v-if="hasOutput && !isExecuting">
      <button class="btn-action btn-success" @click="handleConfirm">
        确认下一步 ✓
      </button>
      <button class="btn-action btn-secondary" @click="handleSkip">
        跳过
      </button>
    </template>

    <button
      v-if="hasError"
      class="btn-action btn-danger"
      @click="handleRetry"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'

const currentExecution = computed(() => agentStore.currentExecution)
const isExecuting = computed(() => agentStore.isExecuting)
const hasOutput = computed(() => currentExecution.value?.output && !currentExecution.value.output.isConfirmed)
const hasError = computed(() => currentExecution.value?.status === 'error')
const canExecute = computed(() => {
  const status = currentExecution.value?.status
  return status === 'pending' || status === 'error' || (status === 'completed' && hasOutput.value)
})

async function handleExecute() {
  const project = projectStore.currentProject
  if (!project) return

  await agentStore.executeCurrent(project.id, project.description)
}

function handleConfirm() {
  agentStore.confirmCurrent()
}

function handleSkip() {
  agentStore.skipCurrent()
}

function handleRetry() {
  const project = projectStore.currentProject
  if (!project) return

  agentStore.retryCurrent(project.id, project.description)
}
</script>

<style scoped>
.pipeline-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-action {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}
</style>
