<template>
  <div class="pipeline-view">
    <h2 class="page-title">🔮 需求管道执行</h2>

    <PipelineProgress />

    <AgentOutput />

    <PipelineActions />

    <CompletionSummary v-if="isCompleted" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import PipelineProgress from './PipelineProgress.vue'
import AgentOutput from './AgentOutput.vue'
import PipelineActions from './PipelineActions.vue'
import CompletionSummary from './CompletionSummary.vue'

const isCompleted = computed(() => !agentStore.hasMoreAgents)
</script>

<style scoped>
.pipeline-view {
  padding: 32px;
  max-width: 1000px;
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
</style>
