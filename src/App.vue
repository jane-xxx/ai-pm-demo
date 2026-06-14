<template>
  <div id="app" class="app-container">
    <Sidebar
      :current-tab="currentTab"
      @change-tab="handleTabChange"
    />

    <MainContent>
      <CreateProject v-if="currentTab === 'new_project'" />

      <ProjectList
        v-else-if="currentTab === 'project_management'"
        @view-project="handleViewProject"
      />

      <ProjectDetail
        v-else-if="currentProjectDetail"
        :project="currentProjectDetail"
        @back="handleBackFromDetail"
      />

      <ConfigPanel v-else-if="currentTab === 'settings'" />
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AppTab, Project } from '@/types'
import Sidebar from './components/layout/Sidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import CreateProject from './components/project/CreateProject.vue'
import ProjectList from './components/project/ProjectList.vue'
import ProjectDetail from './components/project/ProjectDetail.vue'
import ConfigPanel from './components/common/ConfigPanel.vue'
import { projectStore } from './stores/projectStore'

const projectStore = projectStore

const currentTab = ref<AppTab>('new_project')
const currentProjectDetail = ref<Project | null>(null)

function handleTabChange(tab: AppTab) {
  currentTab.value = tab
  if (tab !== 'project_management') {
    currentProjectDetail.value = null
  }
}

function handleViewProject(project: Project) {
  currentProjectDetail.value = project
  import('./stores/agentStore').then(({ agentStore }) => {
    agentStore.loadAgentOutputs(project.id)
  })
}

function handleBackFromDetail() {
  currentProjectDetail.value = null
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #0f172a;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

#app {
  height: 100vh;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}
</style>
