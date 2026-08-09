import { createRouter, createWebHistory } from 'vue-router'

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

export default router
