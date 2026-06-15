<template>
  <div class="completion-summary">
    <div class="success-icon">🎉</div>
    <h2 class="success-title">管道执行完成！</h2>
    <p class="success-message">项目已保存到项目管理</p>

    <div class="completion-actions">
      <button class="btn-action" @click="handleGoToProjects">
        前往项目管理 📁
      </button>
      <button class="btn-action btn-primary" @click="handleNewProject">
        新建项目 ✨
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { projectStore } from '@/stores/projectStore'

const emit = defineEmits<{
  'change-tab': [tab: string]
}>()

function handleViewPRD() {
  emit('change-tab', 'prd_editor')
}

function handleGoToProjects() {
  emit('change-tab', 'project_management')
}

function handleNewProject() {
  projectStore.setCurrentProject(null)
  emit('change-tab', 'new_project')
}
</script>

<style scoped>
.completion-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 8px;
}

.success-message {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 32px;
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  padding: 12px 24px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-action.btn-primary {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-color: transparent;
}
</style>
