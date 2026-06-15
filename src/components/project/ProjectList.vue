<template>
  <div class="project-list">
    <div class="page-header">
      <h2 class="page-title">项目管理</h2>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-filter-bar">
      <div class="search-box" :class="{ 'has-value': searchQuery }">
        <Search class="search-icon" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索项目名称或描述..."
        />
        <button
          v-if="searchQuery"
          class="clear-btn"
          @click="searchQuery = ''"
        >
          <X :size="14" />
        </button>
      </div>

      <div class="filter-box">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">全部</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      <!-- 结果计数 -->
      <div class="result-count">
        <span class="count-number">{{ filteredProjects.length }}</span>
        <span class="count-label">个项目</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredProjects.length === 0" class="empty-state">
      <div class="empty-icon">{{ isFiltering ? '🔍' : '📦' }}</div>
      <p class="empty-text">
        {{ isFiltering ? '没有找到匹配的项目' : '还没有项目' }}
      </p>
      <p v-if="!isFiltering" class="empty-hint">前往"新建项目"创建第一个项目吧</p>
      <button
        v-if="isFiltering"
        class="reset-filter-btn"
        @click="resetFilters"
      >
        清除筛选
      </button>
    </div>

    <!-- 项目网格 -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @view="handleView"
        @delete="handleDelete"
        @continue="handleContinue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { projectStore } from '@/stores/projectStore'
import ProjectCard from './ProjectCard.vue'
import type { Project } from '@/types'

const emit = defineEmits<{
  'view-project': [project: Project]
  'delete': [id: string]
  'continue-project': [project: Project]
}>()

const searchQuery = ref('')
const statusFilter = ref<'all' | 'draft' | 'in_progress' | 'completed'>('all')

// 确保加载项目数据
const projects = computed(() => {
  const all = projectStore.projects
  console.log('Projects loaded:', all.length, all.map(p => ({ name: p.name, status: p.status })))
  return all
})

// 是否在筛选/搜索
const isFiltering = computed(() => {
  return searchQuery.value !== '' || statusFilter.value !== 'all'
})

// 过滤后的项目列表
const filteredProjects = computed(() => {
  const result = projects.value.filter(project => {
    // 状态筛选
    const statusMatch = statusFilter.value === 'all' || project.status === statusFilter.value

    // 搜索筛选
    const searchMatch = !searchQuery.value ||
      project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    return statusMatch && searchMatch
  })
  console.log('Filtered projects:', result.length, 'search:', searchQuery.value, 'status:', statusFilter.value)
  return result
})

// 重置筛选
function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

function handleView(project: Project) {
  console.log('ProjectList handleView:', project.name)
  emit('view-project', project)
}

function handleDelete(projectId: string) {
  console.log('ProjectList handleDelete:', projectId)
  if (confirm('确定要删除这个项目吗？')) {
    projectStore.deleteProject(projectId)
  }
}

function handleContinue(project: Project) {
  console.log('ProjectList handleContinue:', project.name)
  emit('continue-project', project)
}
</script>

<style scoped>
.project-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  background: rgba(15, 17, 26, 0.6);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

/* 搜索和筛选栏 */
.search-filter-bar {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  align-items: center;
}

.search-box {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 10px;
  padding: 0 12px;
  transition: all 0.2s;
  height: 40px;
}

.search-box:focus-within {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(30, 41, 59, 0.8);
}

.search-box.has-value {
  background: rgba(30, 41, 59, 0.8);
}

.search-icon {
  color: #64748b;
  flex-shrink: 0;
}

.search-box:focus-within .search-icon {
  color: #8b5cf6;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e2e8f0;
  font-size: 14px;
  height: 100%;
}

.search-input::placeholder {
  color: #64748b;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0;
}

.filter-box {
  width: 120px;
}

.filter-select {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 10px;
  padding: 0 14px;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filter-select:hover {
  border-color: rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filter-select:focus {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

.filter-select option {
  background: #1e293b;
  color: #e2e8f0;
  padding: 10px 12px;
  border-radius: 6px;
  margin: 2px 0;
}

.filter-select option:hover {
  background: rgba(139, 92, 246, 0.2);
}

.result-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-left: auto;
  color: #64748b;
  font-size: 13px;
}

.count-number {
  font-weight: 600;
  color: #8b5cf6;
  font-size: 16px;
}

.count-label {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 80px 32px;
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

.reset-filter-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filter-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 0 32px 32px;
}
</style>
