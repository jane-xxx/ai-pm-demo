<template>
  <div class="create-project">
    <h2 class="page-title">✨ 新建项目</h2>

    <div v-if="!isExecuting" class="create-form">
      <div class="form-group">
        <label class="form-label">项目名称</label>
        <input
          v-model="form.name"
          type="text"
          class="form-input"
          placeholder="输入项目名称..."
          maxlength="50"
        />
      </div>

      <div class="form-group">
        <label class="form-label">需求描述</label>
        <textarea
          v-model="form.description"
          class="form-textarea"
          placeholder="描述你的产品想法，例如：我要做AI面试产品..."
          rows="6"
          maxlength="500"
        ></textarea>
      </div>

      <button
        class="btn-primary"
        :disabled="!form.name || !form.description"
        @click="startExecution"
      >
        开始执行 ▶
      </button>
    </div>

    <PipelineView v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import PipelineView from '../pipeline/PipelineView.vue'

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
</script>

<style scoped>
.create-project {
  padding: 32px;
  max-width: 800px;
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

.create-form {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
