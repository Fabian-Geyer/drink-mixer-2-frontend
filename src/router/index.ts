import { createRouter, createWebHistory } from 'vue-router'
import { useUiStore } from '@/stores/ui'

declare module 'vue-router' {
  interface RouteMeta {
    requiresPin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/order',
    },
    {
      path: '/order',
      name: 'order',
      component: () => import('../pages/OrderPage.vue'),
    },
    {
      path: '/barkeeper',
      name: 'barkeeper',
      component: () => import('../pages/BarkeeperPage.vue'),
      meta: { requiresPin: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
      meta: { requiresPin: true },
    },
    {
      path: '/status',
      name: 'status',
      component: () => import('../pages/StatusPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFoundPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresPin) {
    const ui = useUiStore()
    if (!ui.pinUnlocked) {
      ui.requestPinGate(to.fullPath)
      return false
    }
  }
  return true
})

export default router
