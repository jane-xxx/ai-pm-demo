<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo">🚀</div>
      <div class="app-name">AI产品经理</div>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['nav-item', { active: currentTab === tab.key }]"
        @click="$emit('change-tab', tab.key)"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <UserAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { userStore } from '@/stores/userStore'
import UserAvatar from './UserAvatar.vue'
import type { AppTab } from '@/types'

defineProps<{
  currentTab: AppTab
}>()

defineEmits<{
  (e: 'change-tab', tab: AppTab): void
}>()

const tabs = [
  { key: 'new_project' as AppTab, icon: '✨', label: '新建项目' },
  { key: 'project_management' as AppTab, icon: '📁', label: '项目管理' },
  { key: 'settings' as AppTab, icon: '⚙️', label: '设置' },
]
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-right: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.logo {
  font-size: 48px;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

.app-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-item {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #e2e8f0;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
  color: #3b82f6;
  border-left: 3px solid #3b82f6;
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}
</style>
