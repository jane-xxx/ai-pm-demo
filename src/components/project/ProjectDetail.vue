<template>
  <div class="project-detail">
    <Breadcrumb
      :items="['项目管理', project.name]"
      @back="$emit('back')"
    />

    <ProjectOverview :project="project" />

    <PipelineProgress v-if="project.status !== 'draft'" />

    <ProjectTabs
      :project="project"
      @tab-change="currentTab = $event"
    />

    <component
      :is="tabComponent"
      :project="project"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/types'
import Breadcrumb from '../common/Breadcrumb.vue'
import ProjectOverview from './ProjectOverview.vue'
import PipelineProgress from '../pipeline/PipelineProgress.vue'
import ProjectTabs from './ProjectTabs.vue'
import AgentHistory from '../agent/AgentHistory.vue'
import PRDEditor from '../agent/PRDEditor.vue'

const props = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'back'): void
}>()

const currentTab = ref<'overview' | 'agent_history' | 'prd_editor'>('overview')

const tabComponent = computed(() => {
  switch (currentTab.value) {
    case 'agent_history':
      return AgentHistory
    case 'prd_editor':
      return PRDEditor
    default:
      return null
  }
})
</script>

<style scoped>
.project-detail {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
