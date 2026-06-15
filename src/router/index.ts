import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'create-project',
    component: () => import('../components/CreateProject.vue'),
    meta: { title: '新建项目' }
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('../components/Workspace.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../components/ProjectManagement.vue'),
    meta: { title: '项目管理' }
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('../components/ProjectManagement.vue'),
    meta: { title: '项目详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫 - 更新页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - AI 产品经理`
  }
  next()
})

export default router
