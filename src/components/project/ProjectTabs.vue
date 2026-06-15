<template>
  <div class="project-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-item', { active: currentTab === tab.key }]"
      @click="$emit('tab-change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDetailTab } from '@/types'

defineProps<{
  project: any
  currentTab?: ProjectDetailTab
}>()

defineEmits<{
  'tab-change': [tab: ProjectDetailTab]
}>()

const tabs = [
  { key: 'overview' as ProjectDetailTab, label: '概览' },
  { key: 'agent_history' as ProjectDetailTab, label: 'Agent历史' },
  { key: 'prd_editor' as ProjectDetailTab, label: 'PRD编辑' },
]
</script>

<style scoped>
.project-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.tab-item {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #e2e8f0;
}

.tab-item.active {
  color: #3b82f6;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}
</style>
