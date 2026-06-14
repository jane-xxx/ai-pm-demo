# AI产品经理Agent - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-step. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 构建一个Vue3应用，帮助用户在编码前通过多Agent协作理清产品需求，最终生成PRD文档

**架构:** 左右分栏布局，左侧导航（新建项目、项目管理、设置），右侧内容区响应式展示。Agent管道式执行，每步确认，进度可视化，数据持久化到localStorage

**技术栈:** Vue 3 (Composition API), TypeScript, localStorage, markdown-it, Tailwind CSS

---

## 文件结构

```
pm-demo/
├── index.html                  # 入口HTML
├── package.json                # 项目配置
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置
├── tailwind.config.js          # Tailwind配置
├── src/
│   ├── main.ts                 # Vue入口
│   ├── App.vue                 # 根组件
│   ├── types/
│   │   ├── index.ts            # 类型定义
│   │   ├── project.ts          # 项目相关类型
│   │   ├── agent.ts            # Agent相关类型
│   │   └── user.ts             # 用户相关类型
│   ├── stores/
│   │   ├── projectStore.ts     # 项目状态管理
│   │   ├── agentStore.ts       # Agent状态管理
│   │   ├── userStore.ts        # 用户状态管理
│   │   └── configStore.ts      # 配置状态管理
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.vue     # 左侧导航栏
│   │   │   ├── UserAvatar.vue  # 用户头像组件
│   │   │   └── MainContent.vue # 右侧内容区容器
│   │   ├── project/
│   │   │   ├── CreateProject.vue      # 新建项目表单
│   │   │   ├── ProjectList.vue         # 项目列表
│   │   │   ├── ProjectCard.vue        # 项目卡片
│   │   │   ├── ProjectDetail.vue      # 项目详情页
│   │   │   ├── ProjectOverview.vue    # 项目概览卡片
│   │   │   └── ProjectTabs.vue        # 项目详情Tab
│   │   ├── pipeline/
│   │   │   ├── PipelineProgress.vue    # 管道进度条
│   │   │   ├── ProgressNode.vue       # 进度节点组件
│   │   │   ├── AgentOutput.vue        # Agent输出展示
│   │   │   ├── PipelineActions.vue    # 管道操作按钮
│   │   │   └── CompletionSummary.vue   # 完成总结
│   │   ├── agent/
│   │   │   ├── AgentHistory.vue       # Agent历史记录
│   │   │   └── PRDEditor.vue          # PRD编辑器
│   │   └── common/
│   │       ├── Breadcrumb.vue         # 面包屑导航
│   │       └── ConfigPanel.vue        # 设置面板
│   ├── services/
│   │   ├── agentService.ts     # Agent执行服务
│   │   ├── storageService.ts   # localStorage服务
│   │   └── markdownService.ts  # Markdown渲染服务
│   ├── utils/
│   │   ├── constants.ts         # 常量定义
│   │   ├── mockData.ts         # Mock数据
│   │   └── helpers.ts           # 辅助函数
│   └── styles/
│       └── theme.css            # 主题样式（科技感）
└── tests/                       # 测试文件（后续）
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `index.html`

- [ ] **Step 1: 创建 package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "ai-product-manager",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "markdown-it": "^14.0.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
EOF
```

- [ ] **Step 2: 创建 vite.config.ts**

```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  }
})
EOF
```

- [ ] **Step 3: 创建 tsconfig.json**

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```bash
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

- [ ] **Step 5: 创建 tailwind.config.js**

```bash
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-bg': '#0f172a',
        'tech-blue': '#3b82f6',
        'tech-purple': '#8b5cf6',
        'tech-green': '#10b981',
        'tech-red': '#ef4444',
        'tech-gray': '#64748b',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #3b82f6' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px #3b82f6' },
        },
        'flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
EOF
```

- [ ] **Step 6: 创建 postcss.config.js**

```bash
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
```

- [ ] **Step 7: 创建 index.html**

```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI产品经理 - 需求管道</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
EOF
```

- [ ] **Step 8: 提交初始化配置**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js index.html
git commit -m "feat: initialize project with Vue3 + Vite + TypeScript + Tailwind"
```

---

## Task 2: 类型定义

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/project.ts`
- Create: `src/types/agent.ts`
- Create: `src/types/user.ts`

- [ ] **Step 1: 创建 src/types/project.ts**

```bash
mkdir -p src/types
cat > src/types/project.ts << 'EOF'
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  currentStep: number
  status: ProjectStatus
  prdContent?: string
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed'

export interface ProjectCreateInput {
  name: string
  description: string
}
EOF
```

- [ ] **Step 2: 创建 src/types/agent.ts**

```bash
cat > src/types/agent.ts << 'EOF'
export type AgentType = 'split' | 'user_analysis' | 'competitor' | 'solution' | 'prd'

export interface AgentOutput {
  id: string
  projectId: string
  agentType: AgentType
  content: string
  timestamp: string
  isConfirmed: boolean
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'error'

export interface AgentExecution {
  agentType: AgentType
  status: AgentStatus
  output?: AgentOutput
  error?: string
}

export interface AgentConfig {
  mode: 'mock' | 'api'
  apiKey?: string
  apiProvider?: 'openai' | 'anthropic' | 'custom'
}

// Agent定义
export const AGENTS = [
  { type: 'split' as AgentType, name: '拆需求Agent', icon: '🔍' },
  { type: 'user_analysis' as AgentType, name: '分析用户Agent', icon: '👥' },
  { type: 'competitor' as AgentType, name: '分析竞品Agent', icon: '📊' },
  { type: 'solution' as AgentType, name: '输出方案Agent', icon: '💡' },
  { type: 'prd' as AgentType, name: '输出PRDAgent', icon: '📝' },
] as const
EOF
```

- [ ] **Step 3: 创建 src/types/user.ts**

```bash
cat > src/types/user.ts << 'EOF'
export interface User {
  id: string
  name: string
  avatar: string
}

export const DEFAULT_USER: User = {
  id: 'user-1',
  name: '产品经理',
  avatar: '👤',
}
EOF
```

- [ ] **Step 4: 创建 src/types/index.ts（统一导出）**

```bash
cat > src/types/index.ts << 'EOF'
export * from './project'
export * from './agent'
export * from './user'

// 应用状态类型
export type AppTab = 'new_project' | 'project_management' | 'settings'
export type ProjectDetailTab = 'overview' | 'agent_history' | 'prd_editor'
EOF
```

- [ ] **Step 5: 提交类型定义**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 3: 工具函数和常量

**Files:**
- Create: `src/utils/constants.ts`
- Create: `src/utils/helpers.ts`
- Create: `src/utils/mockData.ts`

- [ ] **Step 1: 创建 src/utils/constants.ts**

```bash
mkdir -p src/utils
cat > src/utils/constants.ts << 'EOF'
import { AgentType } from '@/types'

// 存储键
export const STORAGE_KEYS = {
  PROJECTS: 'ai_pm_projects',
  AGENT_OUTPUTS: 'ai_pm_agent_outputs',
  USER: 'ai_pm_user',
  CONFIG: 'ai_pm_config',
} as const

// Agent执行顺序
export const AGENT_PIPELINE: AgentType[] = ['split', 'user_analysis', 'competitor', 'solution', 'prd']

// 本地存储清理天数
export const CLEANUP_DAYS = 30
EOF
```

- [ ] **Step 2: 创建 src/utils/helpers.ts**

```bash
cat > src/utils/helpers.ts << 'EOF'
// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 格式化时间
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 清理过期的草稿项目
export function isExpired(days: number, timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime()
  return diff > days * 24 * 60 * 60 * 1000
}
EOF
```

- [ ] **Step 3: 创建 src/utils/mockData.ts**

```bash
cat > src/utils/mockData.ts << 'EOF'
import { AgentType, AgentOutput } from '@/types'

// Mock Agent输出数据
export const MOCK_AGENT_OUTPUTS: Record<AgentType, (input: string) => string> = {
  split: (input: string) => `# 需求拆解结果

## 项目概述
根据您的需求"${input.substring(0, 50)}..."，识别出以下核心信息：

## 核心功能列表
1. 功能点一：基础功能实现
2. 功能点二：核心业务逻辑
3. 功能点三：高级特性

## 技术建议
- 推荐使用现代前端框架
- 考虑后续扩展性`,

  user_analysis: (input: string) => `# 用户分析结果

## 目标用户画像

### 主要用户群体
- **年龄**: 25-40岁
- **职业**: 上班族/自由职业者
- **技术能力**: 中等

### 用户痛点
1. 现有解决方案效率低下
2. 缺乏针对性的工具
3. 学习成本高

### 用户需求
- 简单易用的界面
- 快速上手
- 稳定可靠`,

  competitor: (input: string) => `# 竞品分析结果

## 主要竞品

| 竞品名称 | 优势 | 劣势 |
|---------|------|------|
| 产品A | 功能全面 | 价格昂贵 |
| 产品B | 价格便宜 | 功能简单 |

## 差异化优势
1. 更智能的AI能力
2. 更优的用户体验
3. 更具竞争力的价格`,

  solution: (input: string) => `# 解决方案设计

## 功能详细描述

### 功能一：核心功能
**用户故事**: 作为用户，我希望能够快速完成XXX操作，以便提高效率

**实现要点**:
- 界面简洁直观
- 操作流程优化
- 错误提示友好

### 功能二：辅助功能
**用户故事**: 作为用户，我希望能够XXX，以便获得更好的体验`,

  prd: (input: string) => `# 产品需求文档 (PRD)

## 1. 项目概述
本项目旨在解决用户在XXX场景下的问题...

## 2. 目标用户
- 主要用户群体：上班族、自由职业者
- 用户画像：25-40岁，中等技术能力

## 3. 核心功能
1. 功能点一：基础功能
2. 功能点二：核心业务
3. 功能点三：高级特性

## 4. 竞品分析
主要竞品包括产品A和产品B，我们的差异化优势在于...

## 5. 功能详细描述
(详见解决方案设计章节)

## 6. 用户故事
- 作为用户，我希望能够快速完成操作
- 作为管理员，我希望能够管理用户数据

## 7. 交互设计
- 主界面：简洁直观，核心功能一目了然
- 操作流程：减少操作步骤，提高效率

## 8. 技术限制
- 前端：Vue 3 + TypeScript
- 后端：待定
- 数据存储：localStorage

## 9. 项目里程碑
- 第一阶段：MVP功能开发
- 第二阶段：功能完善
- 第三阶段：性能优化

## 10. 成功指标
- 用户留存率 > 60%
- 用户满意度 > 4.0/5.0
- 核心功能使用率 > 80%`,
}

// 获取Mock输出
export function getMockOutput(agentType: AgentType, input: string): string {
  return MOCK_AGENT_OUTPUTS[agentType](input)
}
EOF
```

- [ ] **Step 4: 提交工具函数**

```bash
git add src/utils/
git commit -m "feat: add utility functions and mock data"
```

---

## Task 4: 服务层

**Files:**
- Create: `src/services/storageService.ts`
- Create: `src/services/agentService.ts`
- Create: `src/services/markdownService.ts`

- [ ] **Step 1: 创建 src/services/storageService.ts**

```bash
mkdir -p src/services
cat > src/services/storageService.ts << 'EOF'
import { Project, AgentOutput, User, AgentConfig } from '@/types'
import { STORAGE_KEYS, CLEANUP_DAYS } from '@/utils/constants'
import { isExpired } from '@/utils/helpers'

class StorageService {
  // 项目操作
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    if (!data) return []
    const projects = JSON.parse(data) as Project[]
    // 清理过期草稿
    return projects.filter(p => {
      if (p.status === 'completed') return true
      return !isExpired(CLEANUP_DAYS, p.createdAt)
    })
  }

  saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects()
    return projects.find(p => p.id === id) || null
  }

  saveProject(project: Project): void {
    const projects = this.getProjects()
    const index = projects.findIndex(p => p.id === project.id)
    if (index >= 0) {
      projects[index] = project
    } else {
      projects.push(project)
    }
    this.saveProjects(projects)
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id)
    this.saveProjects(projects)
  }

  // Agent输出操作
  getAgentOutputs(projectId: string): AgentOutput[] {
    const data = localStorage.getItem(STORAGE_KEYS.AGENT_OUTPUTS)
    if (!data) return []
    const all = JSON.parse(data) as Record<string, AgentOutput[]>
    return all[projectId] || []
  }

  saveAgentOutput(output: AgentOutput): void {
    const data = localStorage.getItem(STORAGE_KEYS.AGENT_OUTPUTS)
    const all: Record<string, AgentOutput[]> = data ? JSON.parse(data) : {}
    if (!all[output.projectId]) {
      all[output.projectId] = []
    }
    const index = all[output.projectId].findIndex(o => o.id === output.id)
    if (index >= 0) {
      all[output.projectId][index] = output
    } else {
      all[output.projectId].push(output)
    }
    localStorage.setItem(STORAGE_KEYS.AGENT_OUTPUTS, JSON.stringify(all))
  }

  // 用户操作
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  }

  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  // 配置操作
  getConfig(): AgentConfig {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG)
    return data ? JSON.parse(data) : { mode: 'mock' }
  }

  saveConfig(config: AgentConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  }
}

export const storageService = new StorageService()
EOF
```

- [ ] **Step 2: 创建 src/services/agentService.ts**

```bash
cat > src/services/agentService.ts << 'EOF'
import { AgentType, AgentOutput } from '@/types'
import { generateId } from '@/utils/helpers'
import { getMockOutput } from '@/utils/mockData'

class AgentService {
  private config: { mode: 'mock' | 'api'; apiKey?: string } = { mode: 'mock' }

  setConfig(config: { mode: 'mock' | 'api'; apiKey?: string }): void {
    this.config = config
  }

  // 执行Agent
  async executeAgent(
    agentType: AgentType,
    projectId: string,
    input: string,
    previousOutputs?: AgentOutput[]
  ): Promise<AgentOutput> {
    // 模拟延迟
    await this.delay(1500)

    let content: string

    if (this.config.mode === 'mock') {
      // Mock模式：使用预设模板
      content = getMockOutput(agentType, input)
    } else {
      // API模式：调用真实LLM（后续实现）
      content = await this.callLLMAPI(agentType, input, previousOutputs || [])
    }

    return {
      id: generateId(),
      projectId,
      agentType,
      content,
      timestamp: new Date().toISOString(),
      isConfirmed: false,
    }
  }

  // 调用LLM API
  // 注意：当前版本使用Mock数据。要启用真实API，请实现以下HTTP调用
  private async callLLMAPI(
    agentType: AgentType,
    input: string,
    previousOutputs: AgentOutput[]
  ): Promise<string> {
    // 构建提示词
    const systemPrompt = this.getSystemPrompt(agentType)
    const userPrompt = this.buildUserPrompt(agentType, input, previousOutputs)

    // 真实API调用示例（当前未启用，需要配置有效API Key后取消注释）
    /*
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      })
      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('API调用失败，回退到Mock模式:', error)
      return getMockOutput(agentType, input)
    }
    */

    // 当前返回Mock数据
    return getMockOutput(agentType, input)
  }

  private getSystemPrompt(agentType: AgentType): string {
    const prompts: Record<AgentType, string> = {
      split: '你是一个产品需求分析师，擅长将模糊的产品想法拆解为具体的功能需求。',
      user_analysis: '你是一个用户研究专家，擅长分析目标用户群体和用户画像。',
      competitor: '你是一个竞品分析专家，擅长分析市场竞争格局和差异化优势。',
      solution: '你是一个解决方案设计师，擅长将需求转化为具体的产品方案。',
      prd: '你是一个技术作家，擅长编写清晰、完整的产品需求文档（PRD）。'
    }
    return prompts[agentType]
  }

  private buildUserPrompt(agentType: AgentType, input: string, previousOutputs: AgentOutput[]): string {
    if (agentType === 'split') {
      return `请分析以下产品需求：\n${input}`
    }
    // 后续Agent基于前续输出
    const context = previousOutputs.map(o => o.content).join('\n\n')
    return `基于以下分析结果：\n${context}\n\n请完成${agentType}相关的分析。`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const agentService = new AgentService()
EOF
```

- [ ] **Step 3: 创建 src/services/markdownService.ts**

```bash
cat > src/services/markdownService.ts << 'EOF'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

class MarkdownService {
  private md: MarkdownIt

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
          } catch (__) {}
        }
        return `<pre class="hljs"><code>${this.md.utils.escapeHtml(str)}</code></pre>`
      },
    })
  }

  render(markdown: string): string {
    return this.md.render(markdown)
  }
}

export const markdownService = new MarkdownService()
EOF
```

- [ ] **Step 4: 提交服务层**

```bash
git add src/services/
git commit -m "feat: add service layer (storage, agent, markdown)"
```

---

## Task 5: 状态管理（Stores）

**Files:**
- Create: `src/stores/projectStore.ts`
- Create: `src/stores/agentStore.ts`
- Create: `src/stores/userStore.ts`
- Create: `src/stores/configStore.ts`

- [ ] **Step 1: 创建 src/stores/projectStore.ts**

```bash
mkdir -p src/stores
cat > src/stores/projectStore.ts << 'EOF'
import { reactive, computed } from 'vue'
import { Project, ProjectCreateInput, ProjectStatus } from '@/types'
import { storageService } from '@/services/storageService'
import { generateId } from '@/utils/helpers'

class ProjectStore {
  private state = reactive({
    projects: [] as Project[],
    currentProject: null as Project | null,
  })

  constructor() {
    this.loadProjects()
  }

  get projects() {
    return this.state.projects
  }

  get currentProject() {
    return this.state.currentProject
  }

  get hasCurrentProject() {
    return this.state.currentProject !== null
  }

  private loadProjects(): void {
    this.state.projects = storageService.getProjects()
  }

  createProject(input: ProjectCreateInput): Project {
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      currentStep: 0,
      status: 'draft' as ProjectStatus,
    }
    this.state.projects.unshift(project)
    storageService.saveProjects(this.state.projects)
    return project
  }

  setCurrentProject(project: Project | null): void {
    this.state.currentProject = project
  }

  updateProject(project: Project): void {
    const index = this.state.projects.findIndex(p => p.id === project.id)
    if (index >= 0) {
      this.state.projects[index] = project
    }
    if (this.state.currentProject?.id === project.id) {
      this.state.currentProject = project
    }
    storageService.saveProjects(this.state.projects)
  }

  deleteProject(id: string): void {
    this.state.projects = this.state.projects.filter(p => p.id !== id)
    if (this.state.currentProject?.id === id) {
      this.state.currentProject = null
    }
    storageService.saveProjects(this.state.projects)
  }
}

export const projectStore = new ProjectStore()
EOF
```

- [ ] **Step 2: 创建 src/stores/agentStore.ts**

```bash
cat > src/stores/agentStore.ts << 'EOF'
import { reactive, computed } from 'vue'
import { AgentType, AgentExecution, AgentStatus, AgentOutput } from '@/types'
import { AGENT_PIPELINE } from '@/utils/constants'
import { agentService } from '@/services/agentService'
import { storageService } from '@/services/storageService'
import { projectStore } from './projectStore'

class AgentStore {
  private state = reactive({
    executions: [] as AgentExecution[],
    isExecuting: false,
    currentAgentIndex: 0,
  })

  get executions() {
    return this.state.executions
  }

  get isExecuting() {
    return this.state.isExecuting
  }

  get currentAgent() {
    if (this.state.currentAgentIndex < AGENT_PIPELINE.length) {
      return AGENT_PIPELINE[this.state.currentAgentIndex]
    }
    return null
  }

  get currentExecution() {
    if (this.currentAgent) {
      return this.state.executions.find(e => e.agentType === this.currentAgent)
    }
    return null
  }

  get hasMoreAgents() {
    return this.state.currentAgentIndex < AGENT_PIPELINE.length
  }

  get progress() {
    return {
      current: this.state.currentAgentIndex,
      total: AGENT_PIPELINE.length,
      completed: this.state.executions.filter(e => e.status === 'completed').length,
    }
  }

  // 初始化管道
  initPipeline(projectId: string): void {
    this.state.executions = AGENT_PIPELINE.map(agentType => ({
      agentType,
      status: 'pending' as AgentStatus,
    }))
    this.state.currentAgentIndex = 0
  }

  // 执行当前Agent
  async executeCurrent(projectId: string, input: string): Promise<AgentOutput | null> {
    const agent = this.currentAgent
    if (!agent) return null

    const execution = this.state.executions.find(e => e.agentType === agent)
    if (!execution) return null

    this.state.isExecuting = true
    execution.status = 'running'

    try {
      // 获取之前的输出
      const previousOutputs = this.state.executions
        .filter(e => e.status === 'completed' && e.output)
        .map(e => e.output!)

      // 执行Agent
      const output = await agentService.executeAgent(agent, projectId, input, previousOutputs)

      execution.status = 'completed'
      execution.output = output

      // 保存到存储
      storageService.saveAgentOutput(output)

      // 更新项目进度
      const project = projectStore.currentProject
      if (project) {
        project.currentStep = this.state.currentAgentIndex + 1
        project.status = 'in_progress'
        projectStore.updateProject(project)
      }

      return output
    } catch (error) {
      execution.status = 'error'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      return null
    } finally {
      this.state.isExecuting = false
    }
  }

  // 确认当前Agent输出，进入下一步
  confirmCurrent(): void {
    if (!this.currentExecution?.output) return

    this.currentExecution.output.isConfirmed = true
    storageService.saveAgentOutput(this.currentExecution.output)

    this.state.currentAgentIndex++
  }

  // 跳过当前Agent
  skipCurrent(): void {
    this.state.currentAgentIndex++
  }

  // 重试当前Agent
  async retryCurrent(projectId: string, input: string): Promise<AgentOutput | null> {
    const execution = this.currentExecution
    if (!execution) return null

    // 重置状态
    execution.status = 'pending'
    execution.error = undefined
    execution.output = undefined

    return this.executeCurrent(projectId, input)
  }

  // 完成管道
  completePipeline(prdContent: string): void {
    const project = projectStore.currentProject
    if (!project) return

    project.status = 'completed'
    project.prdContent = prdContent
    projectStore.updateProject(project)
  }

  // 加载项目的历史输出
  loadAgentOutputs(projectId: string): void {
    const outputs = storageService.getAgentOutputs(projectId)
    this.state.executions = AGENT_PIPELINE.map(agentType => {
      const output = outputs.find(o => o.agentType === agentType)
      return {
        agentType,
        status: output ? 'completed' : 'pending',
        output,
      }
    })

    // 找到第一个未完成的Agent
    const firstIncomplete = this.state.executions.findIndex(e => e.status !== 'completed')
    this.state.currentAgentIndex = firstIncomplete >= 0 ? firstIncomplete : AGENT_PIPELINE.length
  }
}

export const agentStore = new AgentStore()
EOF
```

- [ ] **Step 3: 创建 src/stores/userStore.ts**

```bash
cat > src/stores/userStore.ts << 'EOF'
import { reactive } from 'vue'
import { User, DEFAULT_USER } from '@/types'
import { storageService } from '@/services/storageService'

class UserStore {
  private state = reactive({
    user: storageService.getUser() || DEFAULT_USER,
  })

  get user() {
    return this.state.user
  }

  updateUser(user: Partial<User>): void {
    this.state.user = { ...this.state.user, ...user }
    storageService.saveUser(this.state.user)
  }
}

export const userStore = new UserStore()
EOF
```

- [ ] **Step 4: 创建 src/stores/configStore.ts**

```bash
cat > src/stores/configStore.ts << 'EOF'
import { reactive } from 'vue'
import { AgentConfig } from '@/types'
import { storageService } from '@/services/storageService'
import { agentService } from '@/services/agentService'

class ConfigStore {
  private state = reactive({
    config: storageService.getConfig(),
  })

  get config() {
    return this.state.config
  }

  updateConfig(config: Partial<AgentConfig>): void {
    this.state.config = { ...this.state.config, ...config }
    storageService.saveConfig(this.state.config)
    agentService.setConfig(this.state.config)
  }
}

export const configStore = new ConfigStore()
EOF
```

- [ ] **Step 5: 提交状态管理**

```bash
git add src/stores/
git commit -m "feat: add state management stores"
```

---

## Task 6: 布局组件

**Files:**
- Create: `src/components/layout/Sidebar.vue`
- Create: `src/components/layout/UserAvatar.vue`
- Create: `src/components/layout/MainContent.vue`

- [ ] **Step 1: 创建 src/components/layout/Sidebar.vue**

```bash
mkdir -p src/components/layout
cat > src/components/layout/Sidebar.vue << 'EOF'
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
import { computed } from 'vue'
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
EOF
```

- [ ] **Step 2: 创建 src/components/layout/UserAvatar.vue**

```bash
cat > src/components/layout/UserAvatar.vue << 'EOF'
<template>
  <div class="user-avatar">
    <div class="avatar-icon">{{ user.avatar }}</div>
    <div class="user-name">{{ user.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { userStore } from '@/stores/userStore'

const user = computed(() => userStore.user)
</script>

<style scoped>
.user-avatar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-avatar:hover {
  background: rgba(59, 130, 246, 0.1);
}

.avatar-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
}

.user-name {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}
</style>
EOF
```

- [ ] **Step 3: 创建 src/components/layout/MainContent.vue**

```bash
cat > src/components/layout/MainContent.vue << 'EOF'
<template>
  <main class="main-content">
    <slot />
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background: #0f172a;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: #1e293b;
}

.main-content::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}
</style>
EOF
```

- [ ] **Step 4: 提交布局组件**

```bash
git add src/components/layout/
git commit -m "feat: add layout components (Sidebar, UserAvatar, MainContent)"
```

---

## Task 7: 项目管理组件

**Files:**
- Create: `src/components/project/CreateProject.vue`
- Create: `src/components/project/ProjectList.vue`
- Create: `src/components/project/ProjectCard.vue`
- Create: `src/components/project/ProjectDetail.vue`
- Create: `src/components/project/ProjectOverview.vue`
- Create: `src/components/project/ProjectTabs.vue`

- [ ] **Step 1: 创建 src/components/project/CreateProject.vue**

```bash
mkdir -p src/components/project
cat > src/components/project/CreateProject.vue << 'EOF'
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

function startExecution() {
  // 创建项目
  const project = projectStore.createProject({
    name: form.name,
    description: form.description,
  })

  // 设置为当前项目
  projectStore.setCurrentProject(project)

  // 初始化Agent管道
  agentStore.initPipeline(project.id)

  isExecuting.value = true
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
EOF
```

- [ ] **Step 2: 创建 src/components/project/ProjectList.vue**

```bash
cat > src/components/project/ProjectList.vue << 'EOF'
<template>
  <div class="project-list">
    <h2 class="page-title">📁 项目管理</h2>

    <div v-if="projects.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">还没有项目</p>
      <p class="empty-hint">前往"新建项目"创建第一个项目吧</p>
    </div>

    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @view="handleView"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import ProjectCard from './ProjectCard.vue'
import type { Project } from '@/types'

const emit = defineEmits<{
  (e: 'view-project', project: Project): void
}>()

const projects = computed(() => projectStore.projects)

function handleView(project: Project) {
  emit('view-project', project)
}

function handleDelete(projectId: string) {
  if (confirm('确定要删除这个项目吗？')) {
    projectStore.deleteProject(projectId)
  }
}
</script>

<style scoped>
.project-list {
  padding: 32px;
  max-width: 1200px;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #64748b;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
</style>
EOF
```

- [ ] **Step 3: 创建 src/components/project/ProjectCard.vue**

```bash
cat > src/components/project/ProjectCard.vue << 'EOF'
<template>
  <div class="project-card" @click="$emit('view', project)">
    <div class="card-header">
      <div class="card-icon">📦</div>
      <div class="card-status" :class="statusClass">
        {{ statusText }}
      </div>
    </div>

    <h3 class="card-title">{{ project.name }}</h3>

    <p class="card-description">{{ truncatedDescription }}</p>

    <div class="card-footer">
      <span class="card-time">{{ createdAt }}</span>
      <span class="card-progress">{{ project.currentStep }}/5</span>
    </div>

    <button class="btn-delete" @click.stop="$emit('delete', project.id)">
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/helpers'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'view', project: Project): void
  (e: 'delete', id: string): void
}>()

const truncatedDescription = computed(() => {
  return props.project.description.length > 60
    ? props.project.description.substring(0, 60) + '...'
    : props.project.description
})

const createdAt = computed(() => formatDate(props.project.createdAt))

const statusText = computed(() => {
  switch (props.project.status) {
    case 'draft':
      return '草稿'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
  }
})

const statusClass = computed(() => {
  return props.project.status
})
</script>

<style scoped>
.project-card {
  position: relative;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-icon {
  font-size: 32px;
}

.card-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.card-status.draft {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.card-status.in_progress {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.card-status.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.btn-delete {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.project-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>
EOF
```

- [ ] **Step 4: 提交项目管理组件（第一批）**

```bash
git add src/components/project/CreateProject.vue src/components/project/ProjectList.vue src/components/project/ProjectCard.vue
git commit -m "feat: add project management components (CreateProject, ProjectList, ProjectCard)"
```

- [ ] **Step 5: 创建 src/components/project/ProjectDetail.vue**

```bash
cat > src/components/project/ProjectDetail.vue << 'EOF'
<template>
  <div class="project-detail">
    <Breadcrumb
      :items="['项目管理', project.name]"
      @back="$emit('back')"
    />

    <ProjectOverview :project="project" />

    <PipelineProgress v-if="project.status !== 'draft'" />

    <ProjectTabs
      :project="project"
      @tab-change="currentTab = $event"
    />

    <component
      :is="tabComponent"
      :project="project"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/types'
import Breadcrumb from '../common/Breadcrumb.vue'
import ProjectOverview from './ProjectOverview.vue'
import PipelineProgress from '../pipeline/PipelineProgress.vue'
import ProjectTabs from './ProjectTabs.vue'
import AgentHistory from '../agent/AgentHistory.vue'
import PRDEditor from '../agent/PRDEditor.vue'

const props = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'back'): void
}>()

const currentTab = ref<'overview' | 'agent_history' | 'prd_editor'>('overview')

const tabComponent = computed(() => {
  switch (currentTab.value) {
    case 'agent_history':
      return AgentHistory
    case 'prd_editor':
      return PRDEditor
    default:
      return null
  }
})
</script>

<style scoped>
.project-detail {
  padding: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
EOF
```

- [ ] **Step 6: 创建 src/components/project/ProjectOverview.vue**

```bash
cat > src/components/project/ProjectOverview.vue << 'EOF'
<template>
  <div class="project-overview">
    <div class="overview-header">
      <h1 class="project-name">{{ project.name }}</h1>
      <div class="project-meta">
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          创建时间: {{ createdAt }}
        </span>
        <span class="meta-item">
          <span class="meta-icon">📊</span>
          状态: {{ statusText }}
        </span>
      </div>
    </div>

    <div class="overview-content">
      <h3 class="section-title">需求描述</h3>
      <p class="description-text">{{ project.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/helpers'
import type { Project } from '@/types'

const props = defineProps<{
  project: Project
}>()

const createdAt = computed(() => formatDate(props.project.createdAt))

const statusText = computed(() => {
  switch (props.project.status) {
    case 'draft':
      return '草稿'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
  }
})
</script>

<style scoped>
.project-overview {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.overview-header {
  margin-bottom: 20px;
}

.project-name {
  font-size: 24px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.project-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #94a3b8;
}

.meta-icon {
  font-size: 18px;
}

.overview-content {
  padding-top: 20px;
  border-top: 1px solid rgba(59, 130, 246, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 12px;
}

.description-text {
  font-size: 14px;
  color: #e2e8f0;
  line-height: 1.6;
}
</style>
EOF
```

- [ ] **Step 7: 创建 src/components/project/ProjectTabs.vue**

```bash
cat > src/components/project/ProjectTabs.vue << 'EOF'
<template>
  <div class="project-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['tab-item', { active: currentTab === tab.key }]"
      @click="$emit('tab-change', tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ProjectDetailTab } from '@/types'

defineProps<{
  project: any
  currentTab?: ProjectDetailTab
}>()

defineEmits<{
  (e: 'tab-change', tab: ProjectDetailTab): void
}>()

const tabs = [
  { key: 'overview' as ProjectDetailTab, label: '概览' },
  { key: 'agent_history' as ProjectDetailTab, label: 'Agent历史' },
  { key: 'prd_editor' as ProjectDetailTab, label: 'PRD编辑' },
]
</script>

<style scoped>
.project-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.tab-item {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-item:hover {
  color: #e2e8f0;
}

.tab-item.active {
  color: #3b82f6;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}
</style>
EOF
```

- [ ] **Step 8: 提交项目管理组件（第二批）**

```bash
git add src/components/project/ProjectDetail.vue src/components/project/ProjectOverview.vue src/components/project/ProjectTabs.vue
git commit -m "feat: add project detail components (ProjectDetail, ProjectOverview, ProjectTabs)"
```

---

## Task 8: 管道组件

**Files:**
- Create: `src/components/pipeline/PipelineView.vue`
- Create: `src/components/pipeline/PipelineProgress.vue`
- Create: `src/components/pipeline/ProgressNode.vue`
- Create: `src/components/pipeline/AgentOutput.vue`
- Create: `src/components/pipeline/PipelineActions.vue`
- Create: `src/components/pipeline/CompletionSummary.vue`

- [ ] **Step 1: 创建 src/components/pipeline/PipelineView.vue**

```bash
mkdir -p src/components/pipeline
cat > src/components/pipeline/PipelineView.vue << 'EOF'
<template>
  <div class="pipeline-view">
    <h2 class="page-title">🔮 需求管道执行</h2>

    <PipelineProgress />

    <AgentOutput />

    <PipelineActions />

    <CompletionSummary v-if="isCompleted" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import PipelineProgress from './PipelineProgress.vue'
import AgentOutput from './AgentOutput.vue'
import PipelineActions from './PipelineActions.vue'
import CompletionSummary from './CompletionSummary.vue'

const isCompleted = computed(() => !agentStore.hasMoreAgents)
</script>

<style scoped>
.pipeline-view {
  padding: 32px;
  max-width: 1000px;
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
</style>
EOF
```

- [ ] **Step 2: 创建 src/components/pipeline/PipelineProgress.vue**

```bash
cat > src/components/pipeline/PipelineProgress.vue << 'EOF'
<template>
  <div class="pipeline-progress">
    <div class="progress-line">
      <ProgressNode
        v-for="(agentType, index) in agentTypes"
        :key="agentType"
        :agent-type="agentType"
        :status="getNodeStatus(agentType, index)"
        :is-current="isCurrentNode(index)"
      />
    </div>
    <div class="progress-info">
      <span v-if="currentAgent" class="current-agent">
        正在执行: {{ getAgentName(currentAgent) }}
      </span>
      <span v-else class="progress-complete">
        🎉 管道执行完成
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { AGENTS, type AgentType, type AgentStatus } from '@/types'
import ProgressNode from './ProgressNode.vue'

const agentStore = agentStore
const agentTypes = computed(() => AGENTS.map(a => a.type))
const currentAgent = computed(() => agentStore.currentAgent)

function getNodeStatus(agentType: AgentType, index: number): AgentStatus {
  const execution = agentStore.executions.find(e => e.agentType === agentType)
  if (execution) {
    return execution.status
  }
  return index === 0 ? 'pending' : 'pending'
}

function isCurrentNode(index: number): boolean {
  return agentStore.executions[index]?.status === 'running'
}

function getAgentName(agentType: AgentType): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}
</script>

<style scoped>
.pipeline-progress {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.progress-line::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: linear-gradient(90deg, #1e293b, #334155);
  z-index: 0;
}

.progress-info {
  text-align: center;
  font-size: 14px;
}

.current-agent {
  color: #3b82f6;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.progress-complete {
  color: #10b981;
  font-weight: 600;
}
</style>
EOF
```

- [ ] **Step 3: 创建 src/components/pipeline/ProgressNode.vue**

```bash
cat > src/components/pipeline/ProgressNode.vue << 'EOF'
<template>
  <div
    class="progress-node"
    :class="[`status-${status}`, { 'is-current': isCurrent }]"
  >
    <div class="node-icon">{{ icon }}</div>
    <div class="node-label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AGENTS, type AgentType, type AgentStatus } from '@/types'

const props = defineProps<{
  agentType: AgentType
  status: AgentStatus
  isCurrent: boolean
}>()

const agent = computed(() => AGENTS.find(a => a.type === props.agentType))
const icon = computed(() => agent.value?.icon || '⚪')
const label = computed(() => agent.value?.name || props.agentType)
</script>

<style scoped>
.progress-node {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #1e293b;
  border: 2px solid #64748b;
  transition: all 0.3s;
}

.progress-node.status-pending .node-icon {
  border-color: #64748b;
  background: #1e293b;
}

.progress-node.status-running .node-icon {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
  animation: pulse-glow 2s ease-in-out infinite;
}

.progress-node.status-completed .node-icon {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.progress-node.status-error .node-icon {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  animation: error-pulse 1s ease-in-out infinite;
}

.progress-node.is-current .node-icon {
  transform: scale(1.1);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
  }
}

@keyframes error-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.node-label {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  max-width: 80px;
}

.progress-node.status-completed .node-label {
  color: #10b981;
}

.progress-node.status-running .node-label {
  color: #3b82f6;
  font-weight: 500;
}
</style>
EOF
```

- [ ] **Step 4: 创建 src/components/pipeline/AgentOutput.vue**

```bash
cat > src/components/pipeline/AgentOutput.vue << 'EOF'
<template>
  <div class="agent-output">
    <div v-if="currentExecution && currentExecution.output" class="output-content">
      <div class="output-header">
        <h3 class="output-title">
          {{ getAgentName(currentExecution.agentType) }} 输出
        </h3>
        <span class="output-time">{{ formatTime(currentExecution.output.timestamp) }}</span>
      </div>

      <div class="output-body" v-html="renderedContent"></div>
    </div>

    <div v-else-if="currentExecution && currentExecution.status === 'running'" class="output-loading">
      <div class="loading-spinner"></div>
      <p>正在分析...</p>
    </div>

    <div v-else class="output-empty">
      <div class="empty-icon">📝</div>
      <p>等待执行...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS } from '@/types'
import { formatDate } from '@/utils/helpers'

const agentStore = agentStore
const currentExecution = computed(() => agentStore.currentExecution)

const renderedContent = computed(() => {
  if (currentExecution.value?.output) {
    return markdownService.render(currentExecution.value.output.content)
  }
  return ''
})

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function getAgentName(agentType: string): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}
</script>

<style scoped>
.agent-output {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.output-title {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.output-time {
  font-size: 12px;
  color: #64748b;
}

.output-body {
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
  color: #e2e8f0;
  line-height: 1.7;
}

.output-body::-webkit-scrollbar {
  width: 6px;
}

.output-body::-webkit-scrollbar-track {
  background: #1e293b;
}

.output-body::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

.output-body :deep(h1),
.output-body :deep(h2),
.output-body :deep(h3) {
  color: #3b82f6;
  margin-top: 24px;
  margin-bottom: 12px;
}

.output-body :deep(p) {
  margin-bottom: 12px;
}

.output-body :deep(ul),
.output-body :deep(ol) {
  margin-left: 24px;
  margin-bottom: 12px;
}

.output-body :deep(code) {
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.output-body :deep(pre) {
  background: #1e293b;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 12px;
}

.output-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.output-body :deep(th),
.output-body :deep(td) {
  padding: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  text-align: left;
}

.output-body :deep(th) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.output-loading,
.output-empty {
  padding: 60px 24px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.output-loading p {
  color: #94a3b8;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.output-empty p {
  color: #64748b;
}
</style>
EOF
```

- [ ] **Step 5: 创建 src/components/pipeline/PipelineActions.vue**

```bash
cat > src/components/pipeline/PipelineActions.vue << 'EOF'
<template>
  <div class="pipeline-actions">
    <button
      v-if="canExecute"
      class="btn-action btn-primary"
      :disabled="isExecuting"
      @click="handleExecute"
    >
      {{ isExecuting ? '执行中...' : (hasOutput ? '重新执行' : '开始执行') }}
    </button>

    <template v-if="hasOutput && !isExecuting">
      <button class="btn-action btn-success" @click="handleConfirm">
        确认下一步 ✓
      </button>
      <button class="btn-action btn-secondary" @click="handleSkip">
        跳过
      </button>
    </template>

    <button
      v-if="hasError"
      class="btn-action btn-danger"
      @click="handleRetry"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { projectStore } from '@/stores/projectStore'
import { agentStore } from '@/stores/agentStore'

const projectStore = projectStore
const agentStore = agentStore

const currentExecution = computed(() => agentStore.currentExecution)
const isExecuting = computed(() => agentStore.isExecuting)
const hasOutput = computed(() => currentExecution.value?.output && !currentExecution.value.output.isConfirmed)
const hasError = computed(() => currentExecution.value?.status === 'error')
const canExecute = computed(() => {
  const status = currentExecution.value?.status
  return status === 'pending' || status === 'error' || (status === 'completed' && hasOutput.value)
})

async function handleExecute() {
  const project = projectStore.currentProject
  if (!project) return

  await agentStore.executeCurrent(project.id, project.description)
}

function handleConfirm() {
  agentStore.confirmCurrent()
}

function handleSkip() {
  agentStore.skipCurrent()
}

function handleRetry() {
  const project = projectStore.currentProject
  if (!project) return

  agentStore.retryCurrent(project.id, project.description)
}
</script>

<style scoped>
.pipeline-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
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

.btn-primary {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.3);
  color: #e2e8f0;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}
</style>
EOF
```

- [ ] **Step 6: 创建 src/components/pipeline/CompletionSummary.vue**

```bash
cat > src/components/pipeline/CompletionSummary.vue << 'EOF'
<template>
  <div class="completion-summary">
    <div class="success-icon">🎉</div>
    <h2 class="success-title">管道执行完成！</h2>
    <p class="success-message">项目已保存到项目管理</p>

    <div class="completion-actions">
      <button class="btn-action" @click="handleViewPRD">
        查看PRD 📝
      </button>
      <button class="btn-action" @click="handleGoToProjects">
        前往项目管理 📁
      </button>
      <button class="btn-action btn-primary" @click="handleNewProject">
        新建项目 ✨
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { projectStore } from '@/stores/projectStore'

const emit = defineEmits<{
  (e: 'change-tab', tab: string): void
}>()

function handleViewPRD() {
  // 切换到PRD编辑
  emit('change-tab', 'prd_editor')
}

function handleGoToProjects() {
  emit('change-tab', 'project_management')
}

function handleNewProject() {
  projectStore.setCurrentProject(null)
  emit('change-tab', 'new_project')
}
</script>

<style scoped>
.completion-summary {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 8px;
}

.success-message {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 32px;
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  padding: 12px 24px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.btn-action.btn-primary {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-color: transparent;
}
</style>
EOF
```

- [ ] **Step 7: 提交管道组件**

```bash
git add src/components/pipeline/
git commit -m "feat: add pipeline components (PipelineView, ProgressNode, AgentOutput, Actions, Completion)"
```

---

## Task 9: Agent相关组件

**Files:**
- Create: `src/components/agent/AgentHistory.vue`
- Create: `src/components/agent/PRDEditor.vue`
- Create: `src/components/common/Breadcrumb.vue`
- Create: `src/components/common/ConfigPanel.vue`

- [ ] **Step 1: 创建 src/components/agent/AgentHistory.vue**

```bash
mkdir -p src/components/agent
cat > src/components/agent/AgentHistory.vue << 'EOF'
<template>
  <div class="agent-history">
    <h3 class="section-title">Agent执行历史</h3>

    <div class="history-list">
      <div
        v-for="execution in executions"
        :key="execution.agentType"
        class="history-item"
        :class="{ 'has-error': execution.status === 'error' }"
      >
        <div class="history-header">
          <span class="history-agent">{{ getAgentName(execution.agentType) }}</span>
          <span class="history-status" :class="execution.status">
            {{ getStatusText(execution.status) }}
          </span>
        </div>

        <div v-if="execution.output" class="history-content">
          <div class="history-time">{{ formatTime(execution.output.timestamp) }}</div>
          <div class="history-output" v-html="renderOutput(execution.output.content)"></div>
        </div>

        <div v-if="execution.error" class="history-error">
          错误: {{ execution.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { agentStore } from '@/stores/agentStore'
import { markdownService } from '@/services/markdownService'
import { AGENTS } from '@/types'
import { formatDate } from '@/utils/helpers'

const executions = computed(() => agentStore.executions)

function getAgentName(agentType: string): string {
  return AGENTS.find(a => a.type === agentType)?.name || agentType
}

function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '等待中'
    case 'running':
      return '执行中'
    case 'completed':
      return '已完成'
    case 'error':
      return '错误'
    default:
      return status
  }
}

function formatTime(timestamp: string): string {
  return formatDate(timestamp)
}

function renderOutput(content: string): string {
  return markdownService.render(content)
}
</script>

<style scoped>
.agent-history {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.history-item.has-error {
  border-color: rgba(239, 68, 68, 0.3);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.history-agent {
  font-weight: 600;
  color: #e2e8f0;
}

.history-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.history-status.pending {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.history-status.running {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.history-status.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.history-status.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.history-content {
  padding: 16px;
}

.history-time {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
}

.history-output {
  color: #e2e8f0;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
}

.history-error {
  padding: 16px;
  color: #ef4444;
  font-size: 14px;
}
</style>
EOF
```

- [ ] **Step 2: 创建 src/components/agent/PRDEditor.vue**

```bash
cat > src/components/agent/PRDEditor.vue << 'EOF'
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
import { markdownService } from '@/services/markdownService'
import { agentStore } from '@/stores/agentStore'

const projectStore = projectStore
const agentStore = agentStore

const isEditing = ref(false)
const editContent = ref('')

const currentProject = computed(() => projectStore.currentProject)
const prdContent = computed(() => currentProject.value?.prdContent || generatePRD())

const renderedContent = computed(() => {
  return markdownService.render(prdContent.value)
})

const renderPreview = computed(() => {
  return markdownService.render(editContent.value)
})

function generatePRD(): string {
  // 从Agent输出生成PRD
  const outputs = agentStore.executions
    .filter(e => e.output)
    .map(e => e.output!.content)

  return outputs.join('\n\n---\n\n')
}

function handleSave() {
  if (currentProject.value) {
    currentProject.value.prdContent = editContent.value
    projectStore.updateProject(currentProject.value)
    isEditing.value = false
  }
}

function handleCancel() {
  editContent.value = prdContent.value
  isEditing.value = false
}

function handleExport() {
  // 导出为Markdown文件
  const blob = new Blob([prdContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentProject.value?.name || 'PRD'}.md`
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
EOF
```

- [ ] **Step 3: 创建 src/components/common/Breadcrumb.vue**

```bash
mkdir -p src/components/common
cat > src/components/common/Breadcrumb.vue << 'EOF'
<template>
  <div class="breadcrumb">
    <button class="back-btn" @click="$emit('back')">
      ← 返回
    </button>
    <div class="breadcrumb-trail">
      <span
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
      >
        {{ item }}
        <span v-if="index < items.length - 1" class="separator">></span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: string[]
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #3b82f6;
  color: #e2e8f0;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.breadcrumb-item {
  color: #94a3b8;
}

.breadcrumb-item:last-child {
  color: #3b82f6;
  font-weight: 500;
}

.separator {
  margin: 0 8px;
  color: #64748b;
}
</style>
EOF
```

- [ ] **Step 4: 创建 src/components/common/ConfigPanel.vue**

```bash
cat > src/components/common/ConfigPanel.vue << 'EOF'
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
EOF
```

- [ ] **Step 5: 提交Agent相关组件**

```bash
git add src/components/agent/ src/components/common/
git commit -m "feat: add agent components (AgentHistory, PRDEditor, Breadcrumb, ConfigPanel)"
```

---

## Task 10: 主应用组件

**Files:**
- Create: `src/App.vue`
- Create: `src/main.ts`
- Create: `src/styles/theme.css`

- [ ] **Step 1: 创建 src/App.vue**

```bash
cat > src/App.vue << 'EOF'
<template>
  <div id="app" class="app-container">
    <Sidebar
      :current-tab="currentTab"
      @change-tab="handleTabChange"
    />

    <MainContent>
      <CreateProject v-if="currentTab === 'new_project'" />

      <ProjectList
        v-else-if="currentTab === 'project_management'"
        @view-project="handleViewProject"
      />

      <ProjectDetail
        v-else-if="currentProjectDetail"
        :project="currentProjectDetail"
        @back="handleBackFromDetail"
      />

      <ConfigPanel v-else-if="currentTab === 'settings'" />
    </MainContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AppTab, Project } from '@/types'
import Sidebar from './components/layout/Sidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import CreateProject from './components/project/CreateProject.vue'
import ProjectList from './components/project/ProjectList.vue'
import ProjectDetail from './components/project/ProjectDetail.vue'
import ConfigPanel from './components/common/ConfigPanel.vue'
import { projectStore } from './stores/projectStore'

const projectStore = projectStore

const currentTab = ref<AppTab>('new_project')
const currentProjectDetail = ref<Project | null>(null)

function handleTabChange(tab: AppTab) {
  currentTab.value = tab
  // 切换Tab时清除项目详情
  if (tab !== 'project_management') {
    currentProjectDetail.value = null
  }
}

function handleViewProject(project: Project) {
  currentProjectDetail.value = project
  // 加载项目的Agent历史
  import('./stores/agentStore').then(({ agentStore }) => {
    agentStore.loadAgentOutputs(project.id)
  })
}

function handleBackFromDetail() {
  currentProjectDetail.value = null
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #0f172a;
}
</style>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}
</style>
EOF
```

- [ ] **Step 2: 创建 src/main.ts**

```bash
cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
import './styles/theme.css'

createApp(App).mount('#app')
EOF
```

- [ ] **Step 3: 创建 src/styles/theme.css**

```bash
mkdir -p src/styles
cat > src/styles/theme.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 主题样式 */
:root {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-border: rgba(59, 130, 246, 0.2);
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

/* 科技感发光效果 */
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.glow-purple {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.glow-green {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

/* 渐变边框 */
.gradient-border {
  border: 1px solid transparent;
  background: linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
              linear-gradient(90deg, #3b82f6, #8b5cf6) border-box;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
EOF
```

- [ ] **Step 4: 创建全局样式入口**

```bash
cat > src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './theme.css';
EOF
```

- [ ] **Step 5: 更新 main.ts 使用正确的样式入口**

```bash
cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

createApp(App).mount('#app')
EOF
```

- [ ] **Step 6: 提交主应用组件**

```bash
git add src/App.vue src/main.ts src/styles/
git commit -m "feat: add main App component and entry point"
```

---

## Task 11: 安装依赖和测试

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

```bash
npm install
```

Expected: 所有依赖安装成功，无错误

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

Expected: 服务器在 http://localhost:3000 启动

- [ ] **Step 3: 验证页面加载**

打开浏览器访问 http://localhost:3000

Expected: 看到左侧导航栏和右侧内容区

- [ ] **Step 4: 测试新建项目流程**

1. 点击"新建项目"tab
2. 输入项目名称和需求描述
3. 点击"开始执行"

Expected: 进入管道执行界面，进度条显示

- [ ] **Step 5: 测试Agent执行**

1. 点击"开始执行"按钮
2. 等待Agent执行完成
3. 查看输出内容

Expected: Agent输出显示在界面上，状态变为"已完成"

- [ ] **Step 6: 测试项目管理**

1. 切换到"项目管理"tab
2. 查看项目列表

Expected: 显示刚才创建的项目

- [ ] **Step 7: 提交项目配置更新（如有需要）**

如果有配置调整需要提交：

```bash
git add .
git commit -m "feat: final adjustments and testing"
```

---

## 完成检查

- [ ] 所有任务已完成
- [ ] 代码已提交到git
- [ ] 应用可以正常运行
- [ ] 核心功能可用：
  - [ ] 新建项目
  - [ ] Agent管道执行
  - [ ] 进度可视化
  - [ ] 项目管理
  - [ ] PRD编辑

---

## 后续扩展

1. **真实API接入**
   - 实现agentService.ts中的callLLMAPI方法
   - 添加错误处理和重试机制

2. **导出功能增强**
   - 支持导出为PDF
   - 支持导出为Word

3. **项目分享**
   - 生成分享链接
   - 导入项目

4. **协作功能**
   - 多用户支持
   - 评论和讨论

5. **AI辅助优化**
   - PRD质量评估
   - 自动优化建议
