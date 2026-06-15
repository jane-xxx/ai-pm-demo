<template>
  <div class="project-overview">
    <div class="overview-header">
      <h1 class="project-name">{{ project.name }}</h1>
      <div class="project-meta">
        <span class="meta-time">{{ createdAt }}</span>
        <span class="meta-status" :class="'status-' + project.status">{{ statusText }}</span>
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
  background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.4) 0%,
    rgba(15, 23, 42, 0.6) 100%
  );
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.project-overview::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg,
    rgba(99, 130, 246, 0.3) 0%,
    rgba(139, 92, 246, 0.15) 50%,
    rgba(59, 130, 246, 0.25) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 16px;
}

.project-name {
  font-size: 17px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: 0.01em;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.meta-time {
  font-size: 12px;
  color: #475569;
}

.meta-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.meta-status.status-draft {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.meta-status.status-in_progress {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.meta-status.status-completed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.overview-content {
  padding-top: 14px;
  border-top: 1px solid;
  border-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(99, 130, 246, 0.15) 15%,
    rgba(99, 130, 246, 0.15) 85%,
    transparent 100%
  ) 1;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.description-text {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.65;
  max-width: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
