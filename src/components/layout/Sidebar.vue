<template>
  <div class="sidebar">
    <!-- Logo 区域 -->
    <div class="sidebar-header">
      <div class="logo-icon">M</div>
      <div class="logo-text">
        <div class="logo-name">PM</div>
        <div class="logo-subtitle">AI 产品经理</div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['nav-item', { active: currentRoute === tab.key }]"
        @click="handleNavigate(tab.route)"
      >
        <component :is="tab.icon" class="nav-icon" />
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 用户信息 -->
    <div class="sidebar-footer">
      <div class="user-avatar">PM</div>
      <div class="user-info">
        <div class="user-name">产品经理</div>
        <div class="user-email">pro@pmos.ai</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FilePlus, Zap, FolderOpen } from 'lucide-vue-next'

defineProps<{
  currentRoute: string
}>()

const router = useRouter()

const tabs = [
  { key: 'create-project', route: '/', icon: FilePlus, label: '新建项目' },
  { key: 'workspace', route: '/workspace', icon: Zap, label: 'AI工作台' },
  { key: 'project-management', route: '/projects', icon: FolderOpen, label: '项目管理' },
]

function handleNavigate(route: string) {
  router.push(route)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1A1F2E;
  background: linear-gradient(180deg, #0F111A 0%, #1A1F2E 100%);
}

/* Logo 区域 */
.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6366F1;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.logo-text {
  flex: 1;
}

.logo-name {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 11px;
  color: #6366F1;
  line-height: 1.2;
  margin-top: 2px;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
}

.nav-item {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.nav-item:hover {
  background: rgba(26, 31, 46, 0.8);
  color: #FFFFFF;
}

.nav-item.active {
  background: rgba(26, 31, 46, 0.8);
  color: #FFFFFF;
}

.nav-icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.5;
}

.nav-label {
  font-weight: 500;
}

/* 用户信息 */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #1A1F2E;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6366F1;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  line-height: 1.3;
}

.user-email {
  font-size: 12px;
  color: #9CA3AF;
  line-height: 1.3;
}
</style>
