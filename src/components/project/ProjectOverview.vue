<template>
  <div class="project-overview">
    <div class="overview-header">
      <h1 class="project-name">{{ project.name }}</h1>
      <div class="project-meta">
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          创建时间: {{ createdAt }}
        </span>
        <span class="meta-item">
          <span class="meta-icon">📊</span>
          状态: {{ statusText }}
        </span>
      </div>
    </div>

    <div class="overview-content">
      <h3 class="section-title">需求描述</h3>
      <p class="description-text">{{ project.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/helpers'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()

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
</script>

<style scoped>
.project-overview {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.overview-header {
  margin-bottom: 20px;
}

.project-name {
  font-size: 24px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.project-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.meta-icon {
  font-size: 18px;
}

.overview-content {
  padding-top: 20px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 12px;
}

.description-text {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.6;
}
</style>
