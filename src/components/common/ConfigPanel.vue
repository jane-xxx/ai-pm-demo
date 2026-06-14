<template>
  <div class="config-panel">
    <h2 class="page-title">⚙️ 设置</h2>

    <div class="config-section">
      <h3 class="section-title">Agent执行模式</h3>

      <div class="config-options">
        <label class="config-option">
          <input
            type="radio"
            :value="'mock'"
            v-model="localConfig.mode"
            @change="handleSave"
          />
          <span class="option-label">
            <span class="option-title">Mock模式</span>
            <span class="option-desc">使用预设模板，无需API密钥</span>
          </span>
        </label>

        <label class="config-option">
          <input
            type="radio"
            :value="'api'"
            v-model="localConfig.mode"
            @change="handleSave"
          />
          <span class="option-label">
            <span class="option-title">API模式</span>
            <span class="option-desc">调用真实LLM API，需要API密钥</span>
          </span>
        </label>
      </div>
    </div>

    <div v-if="localConfig.mode === 'api'" class="config-section">
      <h3 class="section-title">API配置</h3>

      <div class="form-group">
        <label class="form-label">API提供商</label>
        <select v-model="localConfig.apiProvider" class="form-select" @change="handleSave">
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">API密钥</label>
        <input
          v-model="localConfig.apiKey"
          type="password"
          class="form-input"
          placeholder="输入API密钥..."
          @blur="handleSave"
        />
      </div>

      <p class="config-hint">
        💡 密钥将仅存储在本地浏览器中
      </p>
    </div>

    <div class="config-section">
      <h3 class="section-title">数据管理</h3>

      <button class="btn-action btn-danger" @click="handleClearData">
        清除所有数据
      </button>

      <p class="config-hint">
        ⚠️ 这将删除所有项目和Agent输出，操作不可恢复
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { configStore } from '@/stores/configStore'
import { storageService } from '@/services/storageService'

const configStore = configStore

const localConfig = reactive({
  mode: configStore.config.mode,
  apiProvider: configStore.config.apiProvider || 'openai',
  apiKey: configStore.config.apiKey || '',
})

function handleSave() {
  configStore.updateConfig({
    mode: localConfig.mode,
    apiProvider: localConfig.apiProvider,
    apiKey: localConfig.apiKey,
  })
}

function handleClearData() {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    localStorage.clear()
    location.reload()
  }
}
</script>

<style scoped>
.config-panel {
  padding: 32px;
  max-width: 600px;
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

.config-section {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 16px;
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-option {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.config-option:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.config-option input[type="radio"] {
  margin-top: 2px;
}

.option-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-weight: 600;
  color: #e2e8f0;
}

.option-desc {
  font-size: 13px;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.form-select,
.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
}

.config-hint {
  font-size: 13px;
  color: #64748b;
  margin-top: 12px;
}

.btn-action {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}
</style>
