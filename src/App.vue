<template>
  <div id="app" class="app-container">
    <Sidebar :current-route="currentRoute" />

    <MainContent>
      <router-view />
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import MainContent from './components/layout/MainContent.vue'

const route = useRoute()

// 计算当前路由对应的 tab
const currentRoute = computed(() => {
  const path = route.path
  if (path === '/') return 'create-project'
  if (path.startsWith('/workspace')) return 'workspace'
  if (path.startsWith('/projects')) return 'project-management'
  return 'create-project'
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #0F111A;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
  background: #0F111A;
  color: #FFFFFF;
}

#app {
  height: 100vh;
  overflow: hidden;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1A1F2E;
}

::-webkit-scrollbar-thumb {
  background: #6366F1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6366F1;
}
</style>
