<template>
  <div class="project-card" @click="handleClick">
    <div class="card-header">
      <h3 class="card-title">{{ project.name }}</h3>
      <button class="btn-delete" @click="handleDeleteClick">
        ×
      </button>
    </div>

    <p class="card-description">{{ truncatedDescription }}</p>

    <div class="card-footer">
      <div class="status-badge" :class="statusClass">
        {{ statusText }}
      </div>
      <span class="card-date">{{ createdAt }}</span>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 进行中状态显示继续生成按钮 -->
    <button
      v-if="project.status === 'in_progress'"
      class="btn-continue"
      @click="handleContinueClick"
    >
      <span class="btn-icon">▶</span>
      继续生成
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

const emit = defineEmits<{
  view: [project: Project]
  delete: [id: string]
  continue: [project: Project]
}>()

const truncatedDescription = computed(() => {
  return props.project.description.length > 80
    ? props.project.description.substring(0, 80) + '...'
    : props.project.description
})

const createdAt = computed(() => formatDate(props.project.createdAt))

const progressPercent = computed(() => {
  return (props.project.currentStep / 5) * 100
})

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
  return `status-${props.project.status}`
})

function handleClick() {
  emit('view', props.project)
}

function handleDeleteClick(event: Event) {
  event.stopPropagation()
  emit('delete', props.project.id)
}

function handleContinueClick(event: Event) {
  event.stopPropagation()
  emit('continue', props.project)
}
</script>

<style scoped>
.project-card {
  position: relative;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(26, 31, 46, 0.8);
}

/* 顶部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  line-height: 1.4;
}

/* 删除按钮 */
.btn-delete {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* 描述 */
.card-description {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 16px;
  line-height: 1.5;
  min-height: 40px;
}

/* 底部信息 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-badge.status-draft {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
}

.status-badge.status-in_progress {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.status-badge.status-completed {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.card-date {
  font-size: 12px;
  color: #64748b;
}

/* 进度条 */
.progress-bar {
  height: 3px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* 继续生成按钮 */
.btn-continue {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-continue .btn-icon {
  font-size: 12px;
}
</style>
