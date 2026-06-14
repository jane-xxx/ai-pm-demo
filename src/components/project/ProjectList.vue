<template>
  <div class="project-list">
    <h2 class="page-title">📁 项目管理</h2>

    <div v-if="projects.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">还没有项目</p>
      <p class="empty-hint">前往"新建项目"创建第一个项目吧</p>
    </div>

    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @view="handleView"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import ProjectCard from './ProjectCard.vue'
import type { Project } from '@/types'

const emit = defineEmits<{
  (e: 'view-project', project: Project): void
}>()

const projects = computed(() => projectStore.projects)

function handleView(project: Project) {
  emit('view-project', project)
}

function handleDelete(projectId: string) {
  if (confirm('确定要删除这个项目吗？')) {
    projectStore.deleteProject(projectId)
  }
}
</script>

<style scoped>
.project-list {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #64748b;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
</style>
