<template>
  <div class="project-card" @click="$emit('view', project)">
    <div class="card-header">
      <div class="card-icon">📦</div>
      <div class="card-status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>

    <h3 class="card-title">{{ project.name }}</h3>

    <p class="card-description">{{ truncatedDescription }}</p>

    <div class="card-footer">
      <span class="card-time">{{ createdAt }}</span>
      <span class="card-progress">{{ project.currentStep }}/5</span>
    </div>

    <button class="btn-delete" @click.stop="$emit('delete', project.id)">
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/helpers'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'view', project: Project): void
  (e: 'delete', id: string): void
}>()

const truncatedDescription = computed(() => {
  return props.project.description.length > 60
    ? props.project.description.substring(0, 60) + '...'
    : props.project.description
})

const createdAt = computed(() => formatDate(props.project.createdAt))

const statusText = computed(() => {
  switch (props.project.status) {
    case 'draft':
      return '草稿'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
  }
})

const statusClass = computed(() => {
  return props.project.status
})
</script>

<style scoped>
.project-card {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 32px;
}

.card-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.card-status.draft {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.card-status.in_progress {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.card-status.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.btn-delete {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.project-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>
