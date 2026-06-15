<template>
  <div class="pipeline-actions">
    <!-- 初始执行按钮 -->
    <button
      v-if="canExecute && !hasOutput"
      class="btn-action btn-primary"
      :disabled="isExecuting"
      @click="handleExecute"
    >
      <span class="btn-icon">{{ isExecuting ? '⏳' : '▶' }}</span>
      {{ isExecuting ? '执行中...' : '开始执行' }}
    </button>

    <!-- 输出完成后的三按钮操作区 -->
    <template v-if="hasOutput && !isExecuting">
      <button class="btn-action btn-success" @click="handleContinue">
        <span class="btn-icon">{{ isLastAgent ? '📄' : '→' }}</span>
        {{ continueButtonText }}
      </button>
      <button class="btn-action btn-warning" @click="handleRegenerate">
        <span class="btn-icon">↻</span>
        重新生成
      </button>
      <button class="btn-action btn-secondary" @click="toggleSupplementInput">
        <span class="btn-icon">+</span>
        添加补充
      </button>
    </template>

    <!-- 需求补充输入框 -->
    <div v-if="showSupplementInput" class="supplement-card">
      <textarea
        v-model="supplementText"
        class="supplement-textarea"
        placeholder="输入补充需求，例如：强调移动端适配、增加数据埋点..."
        rows="3"
        maxlength="300"
      ></textarea>
      <div class="supplement-actions">
        <button class="btn-action btn-primary" @click="handleSupplementAndRegenerate">
          确认补充并重新生成
        </button>
        <button class="btn-action btn-secondary" @click="toggleSupplementInput">
          取消
        </button>
      </div>
    </div>

    <!-- 错误重试按钮 -->
    <button
      v-if="hasError"
      class="btn-action btn-danger"
      @click="handleRetry"
    >
      <span class="btn-icon">🔄</span>
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import { AGENT_PIPELINE } from '@/utils/constants'

const currentExecution = computed(() => agentStore.currentExecution)
const isExecuting = computed(() => agentStore.isExecuting)
const hasOutput = computed(() => currentExecution.value?.output && !currentExecution.value.output.isConfirmed)
const hasError = computed(() => currentExecution.value?.status === 'error')
const canExecute = computed(() => {
  const status = currentExecution.value?.status
  return status === 'pending' || status === 'error'
})

// 判断是否是最后一个agent（prd agent的index是4）
const isLastAgent = computed(() => {
  const currentIndex = agentStore.progress.current
  return currentIndex === AGENT_PIPELINE.length - 1
})

// 继续按钮文本
const continueButtonText = computed(() => {
  return isLastAgent.value ? '导出PRD文档' : '继续下一步'
})

// 需求补充相关状态
const showSupplementInput = ref(false)
const supplementText = ref('')

async function handleExecute() {
  const project = projectStore.currentProject
  if (!project) return

  await agentStore.executeCurrent(project.id, project.description)
}

async function handleContinue() {
  // 先检查是否为倒数第二个agent（solution），如果是则需要确认后执行PRD
  // 先检查是否为最后一个agent（prd），如果是则完成管道
  const currentAgentIndex = agentStore.progress.current
  const isLastAgent = currentAgentIndex === AGENT_PIPELINE.length - 1
  const isSecondToLastAgent = currentAgentIndex === AGENT_PIPELINE.length - 2

  agentStore.confirmCurrent()
  const project = projectStore.currentProject

  // 如果是最后一个agent（prd），导出PRD并完成管道
  if (isLastAgent) {
    if (project && currentExecution.value?.output) {
      agentStore.completePipeline(currentExecution.value.output.content)
      // 导出PDF
      exportPRDAsPDF(project.name, currentExecution.value.output.content)
    }
  } else if (project && agentStore.hasMoreAgents) {
    // 继续执行下一个agent（自动执行）
    await agentStore.executeCurrent(project.id, project.description)
  }
}

// 导出PRD为PDF（通过打印对话框）
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

  // 使用 Blob URL 创建新窗口
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    // 打印窗口关闭时释放 URL
    printWindow.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(url)
    })
  }
}

// HTML 转义函数
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

async function handleRegenerate() {
  // 重新生成当前agent
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

  // 合并原需求和补充需求
  const enhancedDescription = `${project.description}\n\n[补充需求]: ${supplementText.value}`

  showSupplementInput.value = false
  supplementText.value = ''

  // 使用 retryCurrent 来清除旧输出并重新执行
  await agentStore.retryCurrent(project.id, enhancedDescription)
}

function handleRetry() {
  const project = projectStore.currentProject
  if (!project) return

  agentStore.retryCurrent(project.id, project.description)
}
</script>

<style scoped>
.pipeline-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-action {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-success {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #F59E0B;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.btn-warning:hover {
  background: rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.15);
  color: #94A3B8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.25);
  color: #E2E8F0;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
  transform: translateY(-2px);
}

/* 需求补充输入区域 */
.supplement-card {
  width: 100%;
  margin-top: 12px;
  padding: 20px;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  margin-bottom: 16px;
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
  gap: 12px;
}

.supplement-actions .btn-action {
  padding: 10px 18px;
  font-size: 13px;
}
</style>
