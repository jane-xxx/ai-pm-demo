<template>
  <div class="landing-page">
    <!-- 表单区域 -->
    <div v-if="!isExecuting" class="hero-section">
      <h1 class="hero-title">你想创建什么产品？</h1>
      <p class="hero-subtitle">描述你的产品想法，AI 将自动生成完整的产品管理方案</p>

      <!-- 输入框和按钮 -->
      <div class="input-container">
        <input
          v-model="productIdea"
          type="text"
          class="hero-input"
          placeholder="例如：我想要做个赛博算命的玄学网站"
          @keyup.enter="handleStart"
        />
        <button class="hero-button" @click="handleStart">
          开始
          <span class="arrow-icon">→</span>
        </button>
      </div>

      <!-- 示例按钮 -->
      <p class="examples-grid-title">或选择示例</p>
      <div class="examples-grid">
        <button
          v-for="example in examples"
          :key="example"
          class="example-button"
          @click="handleExampleClick(example)"
        >
          {{ example }}
        </button>
      </div>

      <!-- 装饰星星 -->
      <div class="stars">
        <span v-for="i in 20" :key="i" class="star" :style="getStarStyle(i)"></span>
      </div>
    </div>

    <!-- Pipeline 执行界面 -->
    <PipelineView
      v-else
      @change-tab="handleChangeTab"
      @navigate-to-project="handleNavigateToProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import PipelineView from '../pipeline/PipelineView.vue'

const emit = defineEmits<{
  'change-tab': [tab: string]
  'navigate-to-project': []
}>()

const productIdea = ref('')
const isExecuting = ref(false)

// 检查是否有正在执行的项目
function checkExecutingProject() {
  const currentProject = projectStore.currentProject
  if (currentProject) {
    if (currentProject.status === 'in_progress') {
      // 有正在执行的项目，进入 Pipeline 执行模式
      isExecuting.value = true
    } else if (currentProject.status === 'completed') {
      // 已完成的项目，重置表单
      resetForm()
    } else {
      // draft 状态或其他
      isExecuting.value = false
    }
  } else {
    // 没有当前项目
    isExecuting.value = false
  }
}

// 监听当前项目变化
watch(() => projectStore.currentProject, (newProject, oldProject) => {
  // 只在从外部切换项目时检查，不在新建项目时检查
  if (newProject && newProject !== oldProject && newProject.status !== 'draft') {
    checkExecutingProject()
  }
}, { immediate: true })

onMounted(() => {
  checkExecutingProject()
})

const examples = [
  '我想要做个赛博算命的玄学网站',
  '做一个面向设计师的个人作品集生成器',
  '生成一个面向小众品牌的电商官网',
  '做一个少儿编程课程管理平台',
]

async function handleStart() {
  if (productIdea.value.trim()) {
    const projectName = generateProductName(productIdea.value)

    const project = projectStore.createProject({
      name: projectName,
      description: productIdea.value,
    })

    projectStore.setCurrentProject(project)
    agentStore.initPipeline(project.id)

    isExecuting.value = true

    // 等待 UI 更新
    await nextTick()

    // 自动执行第一个agent
    await agentStore.executeCurrent(project.id, productIdea.value)
  }
}

function handleExampleClick(example: string) {
  productIdea.value = example
  // 只填充输入框，让用户手动点击开始
}

function generateProductName(idea: string): string {
  // 从想法中提取关键词作为项目名
  const keywords = idea.match(/(?:做个|做|生成|想要)?(.{2,10})(?:网站|生成器|官网|平台|系统)/)
  return keywords ? keywords[1].trim() : idea.slice(0, 20)
}

function getStarStyle(index: number) {
  const positions = [
    { top: '10%', left: '15%' },
    { top: '20%', left: '80%' },
    { top: '30%', left: '25%' },
    { top: '15%', left: '60%' },
    { top: '40%', left: '90%' },
    { top: '50%', left: '10%' },
    { top: '60%', left: '70%' },
    { top: '70%', left: '30%' },
    { top: '80%', left: '85%' },
    { top: '25%', left: '45%' },
    { top: '35%', left: '55%' },
    { top: '45%', left: '20%' },
    { top: '55%', left: '75%' },
    { top: '65%', left: '40%' },
    { top: '75%', left: '60%' },
    { top: '85%', left: '15%' },
    { top: '12%', left: '35%' },
    { top: '22%', left: '65%' },
    { top: '48%', left: '50%' },
    { top: '72%', left: '88%' },
  ]
  const pos = positions[index - 1] || positions[0]
  const size = Math.random() * 2 + 1
  return {
    top: pos.top,
    left: pos.left,
    width: `${size}px`,
    height: `${size}px`,
  }
}

function handleChangeTab(tab: string) {
  if (tab === 'new_project') {
    resetForm()
  }
  emit('change-tab', tab)
}

function resetForm() {
  productIdea.value = ''
  isExecuting.value = false
  projectStore.setCurrentProject(null)
}

function handleNavigateToProject() {
  emit('navigate-to-project')
}

// 暴露重置方法给父组件
defineExpose({
  resetForm
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  width: 100%;
}

/* 英雄区域 */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 40px 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
  text-align: center;
}

.hero-subtitle {
  font-size: 18px;
  color: #9CA3AF;
  margin-bottom: 32px;
  font-weight: 400;
  text-align: center;
}

/* 输入框容器 */
.input-container {
  display: flex;
  width: 100%;
  max-width: 680px;
  margin: 0 auto 24px;
  background: rgba(26, 31, 46, 0.8);
  border: 1px solid #2A2F3E;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.input-container:focus-within {
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.hero-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 16px 20px;
  font-size: 16px;
  color: #FFFFFF;
}

.hero-input::placeholder {
  color: #6B7280;
}

.hero-button {
  background: #6366F1;
  color: #FFFFFF;
  border: none;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.hero-button:hover {
  background: #4F46E5;
}

.arrow-icon {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.hero-button:hover .arrow-icon {
  transform: translateX(4px);
}

.examples-grid-title {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1.2px;
  color: rgba(145, 150, 161, 0.6);
  line-height: 16px;
  text-align: start;
  margin-bottom: 12px;
  width: 100%;
  max-width: 680px;
}

/* 示例按钮网格 */
.examples-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 680px;
}

.example-button {
  background: rgba(26, 31, 46, 0.6);
  border: 1px solid #2A2F3E;
  color: #FFFFFF;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.example-button:hover {
  background: rgba(26, 31, 46, 0.9);
  border-color: #6366F1;
  transform: translateY(-2px);
}

/* 装饰星星 */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: #FFFFFF;
  border-radius: 50%;
  opacity: 0.3;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
