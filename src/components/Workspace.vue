<template>
  <div class="workspace-page">
    <!-- 工作台顶部 -->
    <div class="workspace-header">
      <div class="header-left">
        <h1 class="page-title">AI 工作台</h1>
        <span v-if="currentProject" class="project-name">{{ currentProject.name }}</span>
      </div>
      <div class="header-right">
        <button v-if="currentProject" class="header-btn" @click="handleViewProject">
          查看项目详情
        </button>
      </div>
    </div>

    <!-- 工作台内容 -->
    <div v-if="currentProject" class="workspace-content">
      <PipelineView />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">✨</div>
      <h2 class="empty-title">开始你的产品之旅</h2>
      <p class="empty-text">描述你的产品想法，AI 将自动为你生成完整的产品需求文档</p>

      <!-- 快速开始示例 -->
      <div class="quick-start-section">
        <p class="quick-start-title">快速开始示例</p>
        <div class="quick-start-cards">
          <button
            v-for="example in quickStartExamples"
            :key="example.title"
            class="quick-start-card"
            @click="handleQuickStart(example.idea)"
          >
            <span class="card-icon">{{ example.icon }}</span>
            <div class="card-content">
              <div class="card-title">{{ example.title }}</div>
              <div class="card-desc">{{ example.desc }}</div>
            </div>
            <span class="card-arrow">→</span>
          </button>
        </div>
      </div>

      <div class="empty-actions">
        <button class="empty-btn btn-primary" @click="handleNewProject">
          + 新建项目
        </button>
        <button class="empty-btn btn-secondary" @click="handleGoToProjects">
          项目管理
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import PipelineView from './pipeline/PipelineView.vue'

const router = useRouter()

const currentProject = computed(() => projectStore.currentProject)

function handleViewProject() {
  if (currentProject.value) {
    router.push(`/projects/${currentProject.value.id}`)
  }
}

function handleNewProject() {
  router.push('/')
}

function handleGoToProjects() {
  router.push('/projects')
}

// 快速开始示例
const quickStartExamples = [
  {
    icon: '🔮',
    title: '赛博算命网站',
    desc: '玄学 + 科技的创意组合',
    idea: '我想要做个赛博算命的玄学网站'
  },
  {
    icon: '🎨',
    title: '设计师作品集',
    desc: '面向设计师的个人展示平台',
    idea: '做一个面向设计师的个人作品集生成器'
  },
  {
    icon: '🛍️',
    title: '小众品牌电商',
    desc: '为独立品牌打造的在线商城',
    idea: '生成一个面向小众品牌的电商官网'
  },
]

async function handleQuickStart(idea: string) {
  // 直接创建项目并开始执行
  const project = projectStore.createProject({
    name: idea.split(' ').slice(0, 4).join(' ') + '...', // 使用前几个词作为项目名
    description: idea,
  })

  // 设置为当前项目
  projectStore.setCurrentProject(project)

  // 初始化 pipeline
  agentStore.initPipeline(project.id)

  // 开始执行第一个 agent
  await agentStore.executeCurrent(project.id, idea)
}

onMounted(() => {
  // 如果当前项目已完成，清除当前项目以显示空状态
  if (currentProject.value?.status === 'completed') {
    projectStore.setCurrentProject(null)
  } else if (currentProject.value) {
    // 有当前项目时，加载输出
    agentStore.loadAgentOutputs(currentProject.value.id)
  }
  // 注意：不再自动查找 in_progress 项目，因为那会让直接访问工作台时也总有项目
})
</script>

<style scoped>
.workspace-page {
  min-height: 100vh;
  width: 100%;
  background: #0F111A;
}

/* 顶部栏 */
.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  background: rgba(15, 17, 26, 0.6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.project-name {
  font-size: 14px;
  color: #9CA3AF;
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 16px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.header-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(99, 102, 241, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.header-btn:hover {
  background: rgba(99, 102, 241, 0.2);
}

/* 工作台内容 */
.workspace-content {
  padding: 24px 32px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #E2E8F0;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  color: #9CA3AF;
  max-width: 480px;
  margin-bottom: 40px;
  line-height: 1.6;
}

/* 快速开始区域 */
.quick-start-section {
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
}

.quick-start-title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 1.2px;
  color: rgba(145, 150, 161, 0.6);
  margin-bottom: 16px;
  text-align: start;
}

.quick-start-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-start-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid #2A2F3E;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.quick-start-card:hover {
  background: rgba(26, 31, 46, 0.9);
  border-color: #6366F1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.card-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #E2E8F0;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 13px;
  color: #9CA3AF;
  line-height: 1.4;
}

.card-arrow {
  font-size: 18px;
  color: #6366F1;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.quick-start-card:hover .card-arrow {
  transform: translateX(4px);
}

.empty-actions {
  display: flex;
  gap: 16px;
}

.empty-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>
