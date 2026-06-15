<template>
  <div class="create-project-page">
    <div class="hero-section">
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'
import { AGENT_PIPELINE } from '@/utils/constants'

const router = useRouter()
const productIdea = ref('')

// 检查是否有快速开始的 idea
onMounted(() => {
  const quickStartIdea = localStorage.getItem('quick_start_idea')
  if (quickStartIdea) {
    productIdea.value = quickStartIdea
    localStorage.removeItem('quick_start_idea')
  }
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

    // 先跳转到工作台
    router.push('/workspace')

    // 等待路由跳转完成后，开始自动执行整个流程
    await nextTick()
    // 给路由一些额外时间完成渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    await autoExecutePipeline(project.id, productIdea.value)
  }
}

// 自动执行第一个 agent
async function autoExecutePipeline(projectId: string, input: string) {
  const project = projectStore.currentProject
  if (!project) return

  // 只执行第一个 agent，后续需要用户手动点击继续
  await agentStore.executeCurrent(projectId, input)
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

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.addEventListener('beforeunload', () => {
      URL.revokeObjectURL(url)
    })
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
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
</script>

<style scoped>
.create-project-page {
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
