<template>
  <div class="project-management-page">
    <!-- 列表视图 -->
    <ProjectList v-if="!$route.params.id" @view-project="handleViewProject" @continue-project="handleContinueProject" />

    <!-- 详情视图 -->
    <ProjectDetail
      v-else
      :project-id="$route.params.id as string"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import ProjectList from './project/ProjectList.vue'
import ProjectDetail from './project/ProjectDetail.vue'

const router = useRouter()

function handleViewProject(project: any) {
  router.push(`/projects/${project.id}`)
}

function handleContinueProject(project: any) {
  // 设置当前项目
  projectStore.setCurrentProject(project)
  agentStore.loadAgentOutputs(project.id)

  // 跳转到工作台
  router.push('/workspace')
}

function handleBack() {
  router.push('/projects')
}
</script>

<style scoped>
.project-management-page {
  min-height: 100vh;
  width: 100%;
}
</style>
