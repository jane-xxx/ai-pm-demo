<template>
  <div class="prd-editor">
    <div class="editor-header">
      <h3 class="section-title">PRD文档编辑</h3>
      <div class="editor-actions">
        <button
          v-if="!isEditing"
          class="btn-action"
          @click="isEditing = true"
        >
          编辑 ✏️
        </button>
        <template v-else>
          <button class="btn-action btn-primary" @click="handleSave">
            保存 💾
          </button>
          <button class="btn-action" @click="handleCancel">
            取消
          </button>
        </template>
        <button class="btn-action" @click="handleExport">
          导出 📥
        </button>
      </div>
    </div>

    <div v-if="!isEditing" class="prd-preview">
      <div v-html="renderedContent"></div>
    </div>

    <div v-else class="prd-edit">
      <div class="edit-pane">
        <textarea
          v-model="editContent"
          class="edit-textarea"
          placeholder="编辑PRD内容..."
        ></textarea>
      </div>
      <div class="preview-pane">
        <div v-html="renderPreview"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import { markdownService } from '@/services/markdownService'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()

const isEditing = ref(false)
const editContent = ref('')

const prdContent = computed(() => props.project.prdContent || generatePRD())

const renderedContent = computed(() => {
  return markdownService.render(prdContent.value)
})

const renderPreview = computed(() => {
  return markdownService.render(editContent.value)
})

function generatePRD(): string {
  const outputs = agentStore.executions
    .filter(e => e.output)
    .map(e => e.output!.content)

  return outputs.join('\n\n---\n\n')
}

function handleSave() {
  props.project.prdContent = editContent.value
  projectStore.updateProject(props.project)
  isEditing.value = false
}

function handleCancel() {
  editContent.value = prdContent.value
  isEditing.value = false
}

function handleExport() {
  const blob = new Blob([prdContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.project.name || 'PRD'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// 初始化编辑内容
editContent.value = prdContent.value
</script>

<style scoped>
.prd-editor {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #3b82f6;
}

.btn-action.btn-primary {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-color: transparent;
}

.prd-preview {
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;
  color: #e2e8f0;
  line-height: 1.7;
}

.prd-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 500px;
}

.edit-pane,
.preview-pane {
  overflow-y: auto;
  border-right: 1px solid rgba(59, 130, 246, 0.1);
}

.edit-pane:last-child {
  border-right: none;
}

.edit-textarea {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #0f172a;
  border: none;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.preview-pane {
  padding: 16px;
  color: #e2e8f0;
}
</style>
