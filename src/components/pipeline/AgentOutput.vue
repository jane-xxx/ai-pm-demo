<template>
  <div v-if="shouldShow" class="agent-output">
    <!-- 输出卡片 -->
    <div class="output-card">
      <!-- 头部 -->
      <div class="output-header">
        <div class="header-left">
          <div class="agent-icon" :class="{ 'is-running': isRunning }">{{ getAgentIcon(currentExecution?.agentType) }}</div>
          <div class="header-text">
            <h3 class="output-title">{{ getAgentName(currentExecution?.agentType) }}</h3>
            <span v-if="currentExecution?.output" class="output-time">{{ formatTime(currentExecution.output.timestamp) }}</span>
            <span v-else-if="isRunning" class="output-status running">正在分析...</span>
            <span v-else class="output-status">等待执行</span>
          </div>
        </div>

        <!-- 头部右侧按钮区域 -->
        <div class="header-actions">
          <!-- 执行中的状态显示 -->
          <div v-if="isRunning && !hasOutput" class="executing-badge">
            <span class="executing-dot"></span>
            <span class="executing-text">执行中</span>
          </div>

          <!-- 有输出时的操作按钮组 - 只保留重新分析和新增需求 -->
          <template v-if="shouldShowActionButtons && !isRunning">
            <button class="header-btn btn-regenerate" @click="handleRegenerate" title="重新分析">
              <span class="btn-icon">↻</span>
              重新分析
            </button>
            <button class="header-btn btn-supplement" @click="toggleSupplementInput" title="新增需求">
              <span class="btn-icon">+</span>
              新增需求
            </button>
          </template>

          <!-- 开始执行按钮 -->
          <button
            v-if="canExecute && !hasOutput && !isRunning"
            class="header-btn btn-start"
            @click="handleExecute"
          >
            <span class="btn-icon">▶</span>
            开始执行
          </button>
        </div>
      </div>

      <!-- 需求补充输入框（展开时显示） -->
      <div v-if="showSupplementInput" class="supplement-section">
        <textarea
          v-model="supplementText"
          class="supplement-textarea"
          placeholder="输入补充需求，例如：强调移动端适配、增加数据埋点..."
          rows="3"
          maxlength="300"
        ></textarea>
        <div class="supplement-actions">
          <button class="action-btn-small btn-primary" @click="handleSupplementAndRegenerate">
            确认补充并重新生成
          </button>
          <button class="action-btn-small btn-secondary" @click="toggleSupplementInput">
            取消
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="output-body-container">
        <!-- Pipeline 完成后显示已完成的 PRD -->
        <div v-if="isPipelineComplete && completedPrdOutput" class="output-body prd-content" v-html="renderedContent"></div>

        <!-- 有输出内容时显示 -->
        <div v-else-if="hasContent && displayContent" class="output-body" v-html="renderedContent"></div>

        <!-- 运行中显示分析过程 -->
        <div v-else-if="isRunning" class="output-analyzing">
          <div class="analysis-log">
            <div class="log-item" v-for="(step, index) in analysisSteps" :key="index" :class="{ 'is-current': index === currentStep }">
              <span class="log-icon">{{ getStepIcon(index) }}</span>
              <span class="log-text">{{ step }}</span>
              <span v-if="index === currentStep" class="log-loading"></span>
            </div>
          </div>
        </div>

        <!-- 等待状态 -->
        <div v-else class="output-empty">
          <p>等待执行...</p>
        </div>
      </div>

      <!-- 完成操作底部栏 - 仅当前执行显示，查看历史时不显示 -->
      <div v-if="hasOutput && !isRunning && !isViewingHistory" class="output-footer">
        <span class="footer-text">需求分析已完成，确认后将推进下一步</span>
        <button class="footer-btn btn-confirm" @click="handleContinue">
          {{ continueButtonText }}
        </button>
      </div>

      <!-- Pipeline 完成后的导出按钮 -->
      <div v-if="isPipelineComplete && completedPrdOutput" class="output-footer">
        <span class="footer-text">PRD 文档已生成完成</span>
        <button class="footer-btn btn-confirm" @click="handleExportPRD">
          导出 PRD 文档
        </button>
      </div>

      <!-- 查看历史时的提示 -->
      <div v-if="isViewingHistory" class="output-footer footer-viewing">
        <span class="footer-text">正在查看历史输出</span>
        <button class="footer-btn btn-back" @click="handleBackToCurrent">
          返回当前执行
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { projectStore } from '@/stores/projectStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS, type AgentType } from '@/types'
import { AGENT_PIPELINE } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

const emit = defineEmits<{
  'continue': []
}>()

const currentExecution = computed(() => agentStore.displayExecution)
const isPipelineComplete = computed(() => !agentStore.hasMoreAgents)
const isRunning = computed(() => currentExecution.value?.status === 'running')

// 当前执行的可操作输出（未确认的）
const hasOutput = computed(() => currentExecution.value?.output && !currentExecution.value.output.isConfirmed)

// 当前执行的 agent 类型
const currentAgentType = computed(() => currentExecution.value?.agentType)

// 是否显示操作按钮（重新分析、新增需求）
// 对于 PRD：只要有输出就显示（即使已确认）
// 对于其他 agent：只有未确认时显示
const shouldShowActionButtons = computed(() => {
  if (!currentExecution.value?.output) return false
  if (currentAgentType.value === 'prd') {
    return true // PRD 始终显示按钮
  }
  return !currentExecution.value.output.isConfirmed // 其他 agent 只有未确认时显示
})

// 显示输出内容（包括历史记录）
const hasContent = computed(() => {
  // 优先检查 displayExecution（包含已完成的 PRD）
  if (agentStore.displayExecution?.output?.content) {
    return true
  }
  // 其次检查 completedPrdOutput
  if (completedPrdOutput.value?.content) {
    return true
  }
  return false
})

const hasError = computed(() => currentExecution.value?.status === 'error')

// 只有当前执行的agent可以操作执行，查看历史的不行
const isViewingHistory = computed(() => {
  return !!agentStore.viewingAgent
})

const canExecute = computed(() => {
  if (isViewingHistory.value) return false
  const status = agentStore.currentExecution?.status
  return status === 'pending' || status === 'error'
})

const isLastAgent = computed(() => {
  const currentIndex = agentStore.progress.current
  return currentIndex === AGENT_PIPELINE.length - 1
})

// 获取已完成的 PRD 输出（用于 pipeline 完成后显示）
const completedPrdOutput = computed(() => {
  if (!isPipelineComplete.value) return null
  const prdExecution = agentStore.executions.find(e => e.agentType === 'prd')
  if (prdExecution?.output?.isConfirmed) {
    return prdExecution.output
  }
  return null
})

const continueButtonText = computed(() => {
  return isLastAgent.value ? '导出PRD文档' : '继续下一步'
})

// 是否显示整个组件
const shouldShow = computed(() => {
  // 如果有当前执行记录且有输出内容，就显示
  if (currentExecution.value?.output?.content) {
    return true
  }
  // 如果 pipeline 完成，检查是否有已完成的 PRD 输出
  if (isPipelineComplete.value) {
    const prdExecution = agentStore.executions.find(e => e.agentType === 'prd')
    if (prdExecution?.output?.isConfirmed) {
      return true // PRD 已完成，显示已完成状态
    }
    return false // PRD 未完成，不显示
  }
  return true
})

// 需求补充相关状态
const showSupplementInput = ref(false)
const supplementText = ref('')

// 分析步骤
const analysisSteps = ref<string[]>([])
const currentStep = ref(0)
const stepInterval = ref<number | null>(null)

// 流式显示的内容
const displayContent = ref('')
const streamingTimer = ref<number | null>(null)

// 根据不同的 agent 类型设置不同的分析步骤
function getAnalysisSteps(agentType?: string): string[] {
  switch (agentType) {
    case 'split':
      return [
        '正在分析产品需求描述...',
        '识别核心功能模块...',
        '拆解用户故事...',
        '生成功能列表...',
        '整理输出格式...'
      ]
    case 'user_analysis':
      return [
        '正在分析目标用户群体...',
        '识别用户痛点...',
        '构建用户画像...',
        '分析使用场景...',
        '生成用户分析报告...'
      ]
    case 'competitor':
      return [
        '正在识别竞品范围...',
        '分析竞品功能对比...',
        '研究差异化优势...',
        '分析市场定位...',
        '生成竞品分析报告...'
      ]
    case 'solution':
      return [
        '正在设计产品架构...',
        '规划功能模块...',
        '设计交互流程...',
        '定义数据结构...',
        '生成解决方案文档...'
      ]
    case 'prd':
      return [
        '正在整理产品需求...',
        '编写功能规格说明...',
        '设计用户流程...',
        '定义验收标准...',
        '生成PRD文档...'
      ]
    default:
      return [
        '正在分析需求...',
        '处理关键信息...',
        '生成输出内容...'
      ]
  }
}

function getStepIcon(index: number): string {
  if (index < currentStep.value) return '✓'
  if (index === currentStep.value) return '⟳'
  return '○'
}

// 启动分析步骤动画
function startAnalysisSteps() {
  analysisSteps.value = getAnalysisSteps(currentExecution.value?.agentType)
  currentStep.value = 0

  stepInterval.value = window.setInterval(() => {
    if (currentStep.value < analysisSteps.value.length - 1) {
      currentStep.value++
    } else {
      currentStep.value = analysisSteps.value.length - 1
    }
  }, 2000)
}

// 停止分析步骤
function stopAnalysisSteps() {
  if (stepInterval.value) {
    clearInterval(stepInterval.value)
    stepInterval.value = null
  }
}

// 监听执行状态
watch(
  () => currentExecution.value?.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'running' && oldStatus !== 'running') {
      startAnalysisSteps()
    }
    if (newStatus === 'completed' || currentExecution.value?.output) {
      stopAnalysisSteps()
    }
  },
  { immediate: true }
)

// 监听输出内容变化，实现流式效果
watch(
  () => currentExecution.value?.output?.content,
  (newContent) => {
    if (newContent && typeof newContent === 'string') {
      stopAnalysisSteps()

      if (streamingTimer.value) {
        clearTimeout(streamingTimer.value)
      }

      const targetContent = newContent
      let currentIndex = 0

      if (targetContent.length < 100) {
        displayContent.value = targetContent
        return
      }

      const streamContent = () => {
        const increment = Math.floor(Math.random() * 20) + 10
        currentIndex = Math.min(currentIndex + increment, targetContent.length)
        displayContent.value = targetContent.slice(0, currentIndex)

        if (currentIndex < targetContent.length) {
          streamingTimer.value = window.setTimeout(streamContent, 30)
        }
      }

      streamContent()
    }
  },
  { immediate: true }
)

// 当切换 agent 时重置状态并加载新内容
watch(
  () => currentExecution.value,
  (newExecution, oldExecution) => {
    // 清理定时器
    if (streamingTimer.value) {
      clearTimeout(streamingTimer.value)
      streamingTimer.value = null
    }
    stopAnalysisSteps()

    const agentTypeChanged = newExecution?.agentType !== oldExecution?.agentType

    if (agentTypeChanged) {
      // 切换到不同agent时重置状态
      currentStep.value = 0
      showSupplementInput.value = false
      supplementText.value = ''
    }

    // 如果新执行有输出内容，直接显示（历史记录不需要流式效果）
    if (newExecution?.output?.content) {
      displayContent.value = newExecution.output.content
    } else if (agentTypeChanged) {
      displayContent.value = ''
    }
  },
  { deep: true }
)

const renderedContent = computed(() => {
  // 优先显示已完成的 PRD
  if (completedPrdOutput.value?.content) {
    return markdownService.render(completedPrdOutput.value.content)
  }
  // 否则显示当前执行的内容
  if (displayContent.value) {
    return markdownService.render(displayContent.value)
  }
  // 如果当前 agent 是 null（pipeline 已完成），尝试从 executions 获取最后一个有内容的输出
  if (!agentStore.currentAgent) {
    const lastWithContent = agentStore.executions.find(e => e.output?.content)
    if (lastWithContent?.output?.content) {
      return markdownService.render(lastWithContent.output.content)
    }
  }
  return ''
})

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function getAgentName(agentType?: string): string {
  if (!agentType) return 'Agent'
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}

function getAgentIcon(agentType?: string): string {
  if (!agentType) return '⚪'
  return AGENTS.find(a => a.type === agentType)?.icon || '⚪'
}

async function handleCopy() {
  if (currentExecution.value?.output?.content) {
    try {
      await navigator.clipboard.writeText(currentExecution.value.output.content)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }
}

async function handleExecute() {
  const project = projectStore.currentProject
  if (!project) return
  await agentStore.executeCurrent(project.id, project.description)
}

async function handleContinue() {
  // 自动取消选中状态，返回当前执行
  agentStore.resetViewingAgent()

  const currentAgentIndex = agentStore.progress.current
  const isLastAgent = currentAgentIndex === AGENT_PIPELINE.length - 1

  if (isLastAgent) {
    // 最后一步：PRD 已自动确认，只需导出 PDF
    const currentOutput = agentStore.currentExecution?.output
    const project = projectStore.currentProject
    if (project && currentOutput) {
      exportPRDAsPDF(project.name, currentOutput.content)
    }
    return
  }

  // 其他步骤：确认并执行下一步
  agentStore.confirmCurrent()
  const project = projectStore.currentProject

  if (project && agentStore.hasMoreAgents) {
    await agentStore.executeCurrent(project.id, project.description)
  }

  emit('continue')
}

function handleExportPRD() {
  if (!completedPrdOutput.value?.content) return
  const project = projectStore.currentProject
  if (project) {
    exportPRDAsPDF(project.name, completedPrdOutput.value.content)
  }
}

function exportPRDAsPDF(projectName: string, content: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(projectName)} - PRD</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        h1, h2, h3 { color: #2c3e50; margin-top: 24px; }
        h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #bdc3c7; padding-bottom: 8px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 16px; border-radius: 6px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #3498db; color: white; }
        ul, ol { margin: 16px 0; padding-left: 24px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(projectName)} - PRD文档</h1>
      ${content}
      <script>
        window.onload = function() {
          window.print();
        }
      <\/script>
    </body>
    </html>
  `

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(url)
    })
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

async function handleRegenerate() {
  const project = projectStore.currentProject
  if (!project) return

  // 如果项目已完成，恢复为进行中状态
  if (project.status === 'completed') {
    project.status = 'in_progress'
    projectStore.updateProject(project)
  }

  await agentStore.retryCurrent(project.id, project.description)
}

function toggleSupplementInput() {
  showSupplementInput.value = !showSupplementInput.value
  supplementText.value = ''
}

async function handleSupplementAndRegenerate() {
  if (!supplementText.value.trim()) return

  const project = projectStore.currentProject
  if (!project) return

  // 如果项目已完成，恢复为进行中状态
  if (project.status === 'completed') {
    project.status = 'in_progress'
    projectStore.updateProject(project)
  }

  const enhancedDescription = `${project.description}\n\n[补充需求]: ${supplementText.value}`

  showSupplementInput.value = false
  supplementText.value = ''

  await agentStore.retryCurrent(project.id, enhancedDescription)
}

function handleBackToCurrent() {
  agentStore.resetViewingAgent()
}

// 组件卸载时清理定时器
onMounted(() => {
  return () => {
    stopAnalysisSteps()
    if (streamingTimer.value) {
      clearTimeout(streamingTimer.value)
    }
  }
})
</script>

<style scoped>
.agent-output {
  width: 100%;
}

/* 输出卡片 */
.output-card {
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

/* 头部 */
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  background: rgba(15, 17, 26, 0.4);
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.agent-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.agent-icon.is-running {
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  }
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.output-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.output-time {
  font-size: 12px;
  color: #6B7280;
}

.output-status {
  font-size: 12px;
  color: #9CA3AF;
}

.output-status.running {
  color: #6366F1;
  animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 头部右侧按钮区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.executing-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
}

.executing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366F1;
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.executing-text {
  font-size: 13px;
  color: #6366F1;
  font-weight: 500;
}

/* 头部按钮样式 */
.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-icon {
  font-size: 14px;
}

.btn-regenerate {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.btn-regenerate:hover {
  background: rgba(245, 158, 11, 0.25);
}

.btn-supplement {
  background: rgba(100, 116, 139, 0.15);
  color: #94A3B8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-supplement:hover {
  background: rgba(100, 116, 139, 0.25);
  color: #E2E8F0;
}

.btn-start {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-start:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 补充输入区域 */
.supplement-section {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
  background: rgba(15, 17, 26, 0.4);
}

.supplement-textarea {
  width: 100%;
  padding: 14px;
  background: rgba(15, 17, 26, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  color: #E2E8F0;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
  font-family: inherit;
  line-height: 1.5;
}

.supplement-textarea:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.supplement-textarea::placeholder {
  color: #6B7280;
}

.supplement-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn-small {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-small.btn-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
}

.action-btn-small.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.action-btn-small.btn-secondary {
  background: rgba(100, 116, 139, 0.15);
  color: #94A3B8;
}

.action-btn-small.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.25);
}

/* 内容容器 */
.output-body-container {
  min-height: 120px;
}

/* 内容区域样式保持不变... */
.output-body {
  padding: 0 24px 24px;
  max-height: 600px;
  overflow-y: auto;
  color: #E2E8F0;
  line-height: 1.7;
  font-size: 14px;
}

.output-body::-webkit-scrollbar {
  width: 6px;
}

.output-body::-webkit-scrollbar-track {
  background: rgba(15, 17, 26, 0.5);
}

.output-body::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

.output-body::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

.output-body :deep(h1),
.output-body :deep(h2),
.output-body :deep(h3) {
  color: #6366F1;
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.output-body :deep(h1) {
  font-size: 20px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  padding-bottom: 8px;
}

.output-body :deep(h2) {
  font-size: 18px;
}

.output-body :deep(h3) {
  font-size: 16px;
}

.output-body :deep(p) {
  margin-bottom: 12px;
}

.output-body :deep(ul),
.output-body :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
}

.output-body :deep(li) {
  margin-bottom: 4px;
}

.output-body :deep(code) {
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  color: #6366F1;
}

.output-body :deep(pre) {
  background: rgba(15, 17, 26, 0.8);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.output-body :deep(pre code) {
  background: transparent;
  padding: 0;
  color: #E2E8F0;
}

.output-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.output-body :deep(th),
.output-body :deep(td) {
  padding: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  text-align: left;
}

.output-body :deep(th) {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  font-weight: 600;
}

.output-body :deep(blockquote) {
  border-left: 3px solid #6366F1;
  padding-left: 16px;
  margin: 12px 0;
  color: #9CA3AF;
}

/* PRD 内容区域 */
.prd-content {
  max-height: 600px;
  overflow-y: auto;
}

/* 分析过程区域 */
.output-analyzing {
  padding: 32px 24px;
}

.analysis-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(15, 17, 26, 0.4);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.log-item.is-current {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.log-icon {
  font-size: 18px;
  min-width: 24px;
  text-align: center;
}

.log-item:not(.is-current) .log-icon {
  color: #10B981;
}

.log-item.is-current .log-icon {
  color: #6366F1;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.log-text {
  font-size: 14px;
  color: #E2E8F0;
  flex: 1;
}

.log-loading {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366F1;
  animation: blink 1s ease-in-out infinite;
}

/* 空状态 */
.output-empty {
  padding: 40px 24px;
  text-align: center;
}

.output-empty p {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

/* 底部操作栏 */
.output-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.15);
  background: rgba(15, 17, 26, 0.4);
}

.footer-text {
  font-size: 14px;
  color: #9CA3AF;
}

.footer-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.footer-btn.btn-confirm {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.footer-btn.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 查看历史时的底部栏 */
.footer-viewing {
  background: rgba(99, 102, 241, 0.1);
  border-top-color: rgba(99, 102, 241, 0.3);
}

.footer-btn.btn-back {
  background: rgba(100, 116, 139, 0.2);
  color: #94A3B8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.footer-btn.btn-back:hover {
  background: rgba(100, 116, 139, 0.3);
  color: #E2E8F0;
}
</style>
