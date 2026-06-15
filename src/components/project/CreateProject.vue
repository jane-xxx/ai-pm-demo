<template>
  <div class="create-project">
    <div class="page-header">
      <h2 class="page-title">✨ 新建项目</h2>
      <div class="header-subtitle">创建一个新的 AI 产品需求分析项目</div>
    </div>

    <div v-if="!isExecuting" class="create-form">
      <div class="form-card">
        <div class="card-decoration">
          <span class="decoration-icon">🚀</span>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">📝</span>
            项目名称
          </label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="输入项目名称..."
            maxlength="50"
          />
          <div class="input-hint">{{ form.name.length }}/50</div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">💡</span>
            需求描述
          </label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="描述你的产品想法，例如：我要做AI面试产品..."
            rows="6"
            maxlength="500"
          ></textarea>
          <div class="input-hint">{{ form.description.length }}/500</div>
        </div>

        <button
          class="btn-primary"
          :disabled="!form.name || !form.description"
          @click="startExecution"
        >
          <span class="btn-icon">▶</span>
          开始执行
        </button>
      </div>
    </div>

    <PipelineView
      v-else
      @change-tab="handleChangeTab"
      @navigate-to-project="handleNavigateToProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import PipelineView from '../pipeline/PipelineView.vue'

const emit = defineEmits<{
  'change-tab': [tab: string]
  'navigate-to-project': []
}>()

const form = reactive({
  name: '',
  description: '',
})

const isExecuting = ref(false)

async function startExecution() {
  const project = projectStore.createProject({
    name: form.name,
    description: form.description,
  })

  projectStore.setCurrentProject(project)
  agentStore.initPipeline(project.id)

  isExecuting.value = true

  // 自动执行第一个agent
  await agentStore.executeCurrent(project.id, project.description)
}

function handleChangeTab(tab: string) {
  // 如果切换到新建项目，重置状态
  if (tab === 'new_project') {
    resetForm()
  }
  emit('change-tab', tab)
}

function resetForm() {
  form.name = ''
  form.description = ''
  isExecuting.value = false
  projectStore.setCurrentProject(null)
}

function handleNavigateToProject() {
  // 跳转到当前项目的详情页
  const project = projectStore.currentProject
  if (project) {
    emit('navigate-to-project')
  }
}

// 暴露重置方法给父组件
defineExpose({
  resetForm
})
</script>

<style scoped>
.create-project {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  font-size: 14px;
  color: #64748b;
}

/* 表单卡片 */
.create-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.6) 100%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

/* 卡片装饰 */
.card-decoration {
  text-align: center;
  margin-bottom: 32px;
}

.decoration-icon {
  font-size: 64px;
  display: inline-block;
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 表单组 */
.form-group {
  margin-bottom: 28px;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.label-icon {
  font-size: 18px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #64748b;
}

.form-textarea {
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
}

.input-hint {
  position: absolute;
  right: 0;
  bottom: -22px;
  font-size: 12px;
  color: #64748b;
}

/* 主按钮 */
.btn-primary {
  width: 100%;
  padding: 16px 24px;
  margin-top: 12px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 14px;
}
</style>
