<template>
  <div class="pipeline-header">
    <!-- 使用 TimelineFlow 替换进度指示器 -->
    <TimelineFlow @view-agent="handleViewAgent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import type { AgentType } from '@/types'
import TimelineFlow from './TimelineFlow.vue'

const emit = defineEmits<{
  'view-agent': [agentType: AgentType | null]
}>()

const project = computed(() => projectStore.currentProject)
const projectName = computed(() => project.value?.name || '未命名项目')

// 格式化日期
const formattedDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

function handleViewAgent(agentType: AgentType | null) {
  emit('view-agent', agentType)
}
</script>

<style scoped>
.pipeline-header {
  display: flex;
  flex-direction: column;
}
</style>
