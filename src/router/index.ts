import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'create-project',
    component: () => import('../components/CreateProject.vue'),
  },
  {
    path: '/workspace',
    name: 'workspace',
    component: () => import('../components/Workspace.vue'),
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../components/ProjectManagement.vue'),
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('../components/ProjectManagement.vue'),
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
// router.beforeEach((to, _from, next) => {
//   const title = to.meta.title as string
//   if (title) {
//     document.title = `${title} - AI 产品经理`
//   }
//   next()
// })

export default router
