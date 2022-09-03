import TheWelcome from '@/views/TheWelcome.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'default',
      component: TheWelcome,
    },
    {
      path: '/login-redirect/:seshId',
      props: true,
      name: 'login-redirect',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/LoginRedirect.vue'),
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/Login.vue'),
      beforeEnter: (to, from) => {
        let authStore = useAuthStore()
        if (authStore.isAuth) return { name: 'dashboard' }
        else return true
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/Dashboard.vue'),
      beforeEnter: (to, from) => {
        let authStore = useAuthStore()
        if (!authStore.isAuth) return { name: 'login' }
        else return true
      },
    },
  ],
})

export default router
