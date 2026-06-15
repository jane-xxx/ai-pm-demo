<template>
  <div class="pipeline-view">
    <!-- PipelineHeader (包含 TimelineFlow) -->
    <PipelineHeader @view-agent="handleViewAgent" />

    <div class="pipeline-content">
      <AgentOutput />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AgentType } from '@/types'
import PipelineHeader from './PipelineHeader.vue'
import AgentOutput from './AgentOutput.vue'

function handleViewAgent(agentType: AgentType | null) {
  // 这个函数不再需要，因为 PipelineHeader 内部处理
  console.log('viewAgent:', agentType)
}
</script>

<style scoped>
.pipeline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.pipeline-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}
</style>
