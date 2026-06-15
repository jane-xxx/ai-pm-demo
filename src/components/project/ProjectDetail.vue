<template>
  <div class="project-detail">
    <Breadcrumb
      :items="['项目管理', latestProject.name]"
      @back="$emit('back')"
    />

    <ProjectOverview :project="latestProject" />

    <!-- 继续生成按钮（仅在所有 agents 未全部完成时显示） -->
    <div v-if="!allAgentsCompleted" class="action-bar">
      <button class="continue-btn" @click="handleContinue">
        <span class="btn-icon">⚡</span>
        继续生成
      </button>
      <span class="action-hint">跳转到工作台继续完成 Pipeline 流程</span>
    </div>

    <!-- TimelineFlow 管道（只在非草稿状态显示） -->
    <div v-if="latestProject.status !== 'draft'" class="pipeline-wrapper">
      <TimelineFlow :viewing-agent="selectedAgent" :readonly="true" :compact="true" @view-agent="handleViewAgent" />
    </div>

    <!-- 选中的 Agent 历史输出 -->
    <div v-if="latestProject.status !== 'draft' && selectedAgent" class="output-wrapper">
      <AgentOutputView :agent-type="selectedAgent" :project-id="latestProject.id" />
    </div>

    <!-- 空状态提示 -->
    <div v-else-if="latestProject.status !== 'draft' && !selectedAgent" class="empty-output">
      <p>请选择一个节点查看历史输出</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AgentType } from '@/types'
import Breadcrumb from '../common/Breadcrumb.vue'
import ProjectOverview from './ProjectOverview.vue'
import TimelineFlow from '../pipeline/TimelineFlow.vue'
import AgentOutputView from './AgentOutputView.vue'
import { agentStore } from '@/stores/agentStore'
import { projectStore } from '@/stores/projectStore'
import { storageService } from '@/services/storageService'

const router = useRouter()

const props = defineProps<{
  projectId: string
}>()

defineEmits<{
  (e: 'back'): void
}>()

// 独立的选中状态，不与 Pipeline 页面共享
const selectedAgent = ref<AgentType | null>(null)

// 始终从存储获取最新的项目数据
const latestProject = computed(() => {
  const fresh = storageService.getProject(props.projectId)
  if (!fresh) {
    // 如果 storage 中没有，从 store 中查找
    return projectStore.projects.find(p => p.id === props.projectId)
  }
  console.log('latestProject prdContent:', fresh?.prdContent ? 'exists' : 'empty')
  return fresh
})

// 检查是否所有 agents 都已完成并确认
const allAgentsCompleted = computed(() => {
  const executions = agentStore.executions
  if (executions.length === 0) return false

  // 检查是否所有 agents 都已完成并确认
  return executions.every(e =>
    e.status === 'completed' && e.output?.isConfirmed === true
  )
})

// 监听 projectId 变化
watch(() => props.projectId, (newProjectId) => {
  loadProjectData(newProjectId)
}, { immediate: true })

function loadProjectData(projectId: string) {
  // 清空 agentStore 的 viewing 状态，避免干扰
  agentStore.setViewingAgent(null)

  // 加载项目的 agent 输出
  agentStore.loadAgentOutputs(projectId)

  // 找到第一个已完成的 agent 作为默认选中
  const firstCompleted = agentStore.executions.find(
    e => e.status === 'completed' && e.output?.isConfirmed
  )
  if (firstCompleted) {
    selectedAgent.value = firstCompleted.agentType
  } else {
    // 如果没有已完成的，选中第一个有输出的
    const firstWithOutput = agentStore.executions.find(e => e.output)
    if (firstWithOutput) {
      selectedAgent.value = firstWithOutput.agentType
    }
  }
}

onUnmounted(() => {
  // 组件卸载时清空状态
  agentStore.setViewingAgent(null)
})

function handleViewAgent(agentType: string | null) {
  selectedAgent.value = agentType as AgentType
}

function handleContinue() {
  // 设置当前项目
  projectStore.setCurrentProject(latestProject.value)
  // 加载项目的 agent 输出（确保工作台状态一致）
  agentStore.loadAgentOutputs(latestProject.value.id)
  // 跳转到工作台
  router.push('/workspace')
}
</script>

<style scoped>
.project-detail {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  font-size: 18px;
}

.action-hint {
  font-size: 13px;
  color: #9CA3AF;
}

.pipeline-wrapper {
  margin-bottom: 24px;
}

.output-wrapper {
  /* 移除背景，由 AgentOutputView 组件提供 */
  min-height: 200px;
}

.empty-output {
  background: rgba(26, 31, 46, 0.4);
  border: 1px dashed rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  color: #64748b;
}
</style>
