<template>
  <div class="timeline-flow-container">
    <!-- Background cyber accent glows -->
    <div class="glow-purple-left"></div>
    <div class="glow-blue-right"></div>

    <div class="glass-card" :class="{ 'is-compact': props.compact }">
      <!-- Decorative corner grid background element -->
      <div class="grid-background"></div>

      <!-- Timeline Interactive Layout -->
      <div class="timeline-nodes-container">
        <template v-for="(agent, idx) in agents" :key="agent.type">
          <!-- 节点 -->
          <div
            @click="handleNodeClick(agent.type)"
            class="timeline-node"
            :class="getNodeClasses(agent.type)"
          >
            <!-- 节点圆圈 -->
            <div class="node-circle" :class="getCircleClasses(agent.type)">
              <!-- 图标 -->
              <component
                :is="getAgentIcon(agent.type)"
                class="node-icon"
                :size="20"
              />
              <!-- 弹跳小点 - running 状态始终显示 -->
              <div v-if="isRunning(agent.type)" class="running-dot"></div>
            </div>

            <!-- 文字描述 -->
            <div class="node-text">
              <span class="node-name" :class="getNameClasses(agent.type)">
                {{ agent.name }}
              </span>
              <span class="node-description">{{ getAgentDescription(agent.type) }}</span>
            </div>
          </div>

          <!-- 连接线段（除了最后一个节点） -->
          <div
            v-if="idx < agents.length - 1"
            class="connection-segment"
            :class="getSegmentStatusClass(idx)"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Search,
  Users,
  BarChart3,
  Lightbulb,
  FileText,
  type Component
} from 'lucide-vue-next'
import { agentStore } from '@/stores/agentStore'
import { projectStore } from '@/stores/projectStore'
import { AGENTS, type AgentType } from '@/types'

const props = defineProps<{
  // 外部传入的选中状态（用于项目详情等独立场景）
  viewingAgent?: AgentType | null
  // 只读模式：在项目详情页中使用，不显示正在执行的状态
  readonly?: boolean
  // 紧凑模式：去掉左右 padding（用于项目详情页）
  compact?: boolean
}>()

const emit = defineEmits<{
  'view-agent': [agentType: AgentType | null]
}>()

const agents = AGENTS
const isExecuting = computed(() => agentStore.isExecuting)

// 优先使用外部传入的 viewingAgent，否则使用 store 中的
const viewingAgent = computed(() => {
  if (props.viewingAgent !== undefined) {
    return props.viewingAgent
  }
  return agentStore.viewingAgent
})

// Count completed agents
const completedCount = computed(() => {
  return agentStore.executions.filter(e => e.status === 'completed').length
})

// Get current running agent index for progress line
const currentStage = computed(() => {
  const runningIndex = agentStore.executions.findIndex(e => e.status === 'running')
  if (runningIndex >= 0) return runningIndex + 1
  return completedCount.value
})

// Helper functions
const getAgentIcon = (type: AgentType): Component => {
  const iconMap: Record<AgentType, Component> = {
    split: Search,
    user_analysis: Users,
    competitor: BarChart3,
    solution: Lightbulb,
    prd: FileText
  }
  return iconMap[type] || Search
}

const getCurrentAgentName = (): string => {
  const current = agentStore.currentExecution
  if (!current) return ''
  const agent = AGENTS.find(a => a.type === current.agentType)
  return agent?.name || ''
}

const getAgentDescription = (type: AgentType): string => {
  const descriptions: Record<AgentType, string> = {
    split: '拆解需求',
    user_analysis: '用户画像',
    competitor: '竞品分析',
    solution: '方案设计',
    prd: 'PRD文档'
  }
  return descriptions[type] || ''
}

const isCompleted = (type: AgentType): boolean => {
  const execution = agentStore.executions.find(e => e.agentType === type)
  // PRD agent 执行完成就算已完成（不需要确认）
  if (type === 'prd' && execution?.status === 'completed') {
    return true
  }
  // 其他 agent：需要已确认才算真正完成
  return execution?.status === 'completed' && execution.output?.isConfirmed === true
}

const isRunning = (type: AgentType): boolean => {
  // 只读模式（项目详情页）：不显示正在执行的状态
  if (props.readonly) {
    return false
  }

  // 检查项目是否已完成，完成后不显示任何动画
  const project = projectStore.currentProject
  if (project?.status === 'completed') {
    return false
  }

  const execution = agentStore.executions.find(e => e.agentType === type)
  // 执行中，或执行完成但未确认的都算 running
  // 但最后一个 agent (PRD) 完成后不算 running
  if (type === 'prd' && execution?.status === 'completed') {
    return false
  }
  return execution?.status === 'running' ||
    (execution?.status === 'completed' && !execution.output?.isConfirmed)
}

const isCurrent = (type: AgentType): boolean => {
  return agentStore.currentAgent === type
}

const isCurrentOrRunning = (type: AgentType): boolean => {
  return isCurrent(type) || isRunning(type)
}

const canView = (type: AgentType): boolean => {
  // 只有已完成（已确认）的节点才能选中查看
  return isCompleted(type)
}

const isViewing = (type: AgentType): boolean => {
  return viewingAgent.value === type
}

// Class getters
const getNodeClasses = (type: AgentType) => {
  return {
    'status-completed': isCompleted(type),
    'status-running': isRunning(type),
    'status-current': isCurrent(type),
    'is-viewing': isViewing(type),
    'can-click': canView(type) || isRunning(type)
  }
}

const getCircleClasses = (type: AgentType) => {
  if (isViewing(type)) return 'circle-viewing'
  if (isRunning(type)) return 'circle-running'
  // PRD agent 特殊处理：优先检查 isCompleted
  if (type === 'prd' && isCompleted(type)) {
    return 'circle-completed'
  }
  if (isCurrent(type)) return 'circle-current'
  if (isCompleted(type)) return 'circle-completed'
  return 'circle-inactive'
}

const getNameClasses = (type: AgentType) => {
  if (isViewing(type)) return 'name-viewing'
  if (isRunning(type)) return 'name-running'
  if (isCurrent(type)) return 'name-current'
  if (isCompleted(type)) return 'name-completed'
  return 'name-inactive'
}

// 获取线段状态 - 基于前面的节点状态
const getSegmentStatusClass = (index: number) => {
  // 只有前面的节点已确认后，线段才是已完成状态
  if (isCompleted(agents[index].type)) {
    return 'segment-completed'
  }
  return 'segment-inactive'
}

const handleNodeClick = (type: AgentType) => {
  // 点击 running 节点：返回当前执行
  if (isRunning(type)) {
    emit('view-agent', null)
    return
  }

  // 点击 completed 节点：选中查看历史
  if (canView(type)) {
    if (viewingAgent.value !== type) {
      emit('view-agent', type)
    }
  }
}

const handleResetView = () => {
  emit('view-agent', null)
}
</script>

<style scoped>
/* CSS Variables - 匹配参考图片 */
:root {
  /* 进度线颜色 - 参考图的青蓝色 */
  --progress-active: #00D4FF;
  --progress-inactive: #262640;

  /* 节点颜色 */
  --node-bg-completed: #12121F;
  --node-border-completed: #262640;
  --node-border-inactive: #262640;
  --node-border-current: #7B68EE;

  /* 发光效果 */
  --glow-current: 0 0 20px rgba(123, 104, 238, 0.6);
  --glow-progress: 0 0 12px rgba(0, 212, 255, 0.5);

  /* 指示器颜色 - 粉红色 */
  --indicator-color: #FF3366;

  /* 背景和文字 */
  --bg-primary: #0E0F17;
  --bg-secondary: #141521;
  --bg-card: #181926;

  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  --border-color: rgba(255, 255, 255, 0.05);
  --border-hover: rgba(255, 255, 255, 0.1);
}

/* Container */
.timeline-flow-container {
  width: 100%;
  position: relative;
}

/* Background glows */
.glow-purple-left {
  position: absolute;
  top: 50%;
  left: 15%;
  transform: translateY(-50%);
  width: 350px;
  height: 60px;
  background: rgba(139, 92, 246, 0.1);
  filter: blur(50px);
  border-radius: 9999px;
  pointer-events: none;
  z-index: -1;
}

.glow-blue-right {
  position: absolute;
  top: 50%;
  right: 15%;
  transform: translateY(-50%);
  width: 350px;
  height: 60px;
  background: rgba(6, 182, 212, 0.1);
  filter: blur(50px);
  border-radius: 9999px;
  pointer-events: none;
  z-index: -1;
}

/* Glass card */
.glass-card {
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.glass-card.is-compact .timeline-nodes-container {
  padding: 0;
}

/* Grid background */
.grid-background {
  position: absolute;
  inset: 0;
  background: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
}

/* Header */
.timeline-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 10;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ping-indicator {
  display: flex;
  height: 0.5rem;
  width: 0.5rem;
  position: relative;
}

.ping-dot {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  position: absolute;
  display: inline-flex;
  height: 100%;
  width: 100%;
  border-radius: 9999px;
  background: var(--cyber-purple);
  opacity: 0.75;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.static-dot {
  position: relative;
  display: inline-flex;
  border-radius: 9999px;
  height: 0.5rem;
  width: 0.5rem;
  background: var(--cyber-purple);
}

.status-text {
  font-size: 0.75rem;
  font-family: ui-monospace, monospace;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.project-name {
  color: var(--cyber-blue);
  font-weight: 700;
}

/* Header actions */
.header-actions {
  display: flex;
  gap: 0.5rem;
}

.reset-btn {
  font-size: 0.625rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
  cursor: pointer;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.01);
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.badge-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--cyber-blue);
}

/* Timeline nodes container */
.timeline-nodes-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 2rem;
  user-select: none;
}

/* 连接线段 - 自动填充节点之间的空间 */
.connection-segment {
  flex: 1;
  height: 2px;
  background: rgba(99, 102, 241, 0.2);
  min-width: 30px;
  position: relative;
  z-index: 0;
  transform: translateY(-26px);
}

.segment-completed {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
}

/* Timeline node */
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.3s;
  text-align: center;
  flex: 0 0 auto;
  max-width: 120px;
  cursor: default;
  z-index: 1;
}

.timeline-node.can-click {
  cursor: pointer;
}

.timeline-node.can-click:hover .node-icon {
  transform: scale(1.1);
}

.timeline-node.can-click:hover .node-description {
  color: var(--text-secondary);
}

/* Node circle */
.node-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  font-size: 24px;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid #64748b;
}

/* Circle states */
.circle-viewing {
  background: transparent;
  border: 2px solid #06B6D4;
}

.circle-running {
  background: linear-gradient(to right, #8B5CF6, #4F46E5);
  border: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
  animation: pulse-effect 2s ease-in-out infinite;
}

/* 背景光晕 */
.circle-running::after {
  content: '';
  position: absolute;
  inset: -8px;
  background: rgba(139, 92, 246, 0.05);
  filter: blur(20px);
  z-index: -1;
  border-radius: 50%;
  animation: pulse-effect 2s ease-in-out infinite;
  pointer-events: none;
}

.circle-current {
  background: #1A1A2E;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.circle-completed {
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid #8B5CF6;
}

.circle-inactive {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.timeline-node.can-click:hover .circle-inactive {
  background: rgba(255, 255, 255, 0.08);
}

/* Current indicator - 粉红色小点 */
.current-indicator {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  height: 0.6rem;
  width: 0.6rem;
  border-radius: 9999px;
  background: var(--indicator-color);
  box-shadow: 0 0 8px var(--indicator-color);
  border: 2px solid var(--bg-primary);
  animation: bounce 1s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: var(--glow-current);
  }
  50% {
    box-shadow: 0 0 30px rgba(123, 104, 238, 0.8);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}

/* Node icon */
.node-icon {
  color: #FFFFFF;
  flex-shrink: 0;
}

.circle-inactive .node-icon {
  color: rgba(255, 255, 255, 0.4);
}

.circle-viewing .node-icon {
  color: #06B6D4;
}

/* 弹跳小点 - 独立元素，viewing 状态也显示 */
.running-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #EC4899;
  box-shadow: 0 0 8px #EC4899;
  border: 2px solid white;
  animation: bounce-effect 1s infinite;
  z-index: 10;
}

/* 呼吸脉冲动画 */
@keyframes pulse-effect {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 弹跳动画 */
@keyframes bounce-effect {
  0%, 100% {
    transform: translateY(-25%);
  }
  50% {
    transform: translateY(0);
  }
}

/* 删除旧的 node-number 样式 */

/* Node text */
.node-text {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
}

.node-name {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.name-viewing {
  color: var(--progress-active);
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.name-running {
  color: var(--text-primary);
  text-shadow: 0 0 8px rgba(123, 104, 238, 0.4);
}

.name-current {
  color: var(--text-muted);
}

.name-completed {
  color: var(--text-primary);
}

.name-inactive {
  color: var(--text-muted);
}

.timeline-node.can-click:hover .name-inactive {
  color: var(--text-secondary);
}

.node-description {
  margin-top: 0.25rem;
  font-size: 0.5625rem;
  color: var(--text-muted);
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  max-width: 120px;
  transition: color 0.2s;
}
</style>
