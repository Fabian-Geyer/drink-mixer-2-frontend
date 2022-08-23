import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/barkeeper', component: () => import('pages/barkeeper.vue') },
      { path: '/settings', component: () => import('pages/settings.vue') },
      { path: '/order', component: () => import('pages/order.vue') }
  ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
