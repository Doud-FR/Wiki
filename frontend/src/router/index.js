import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/admin/register',
    name: 'AdminRegister',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/Documents.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/document/:id',
    name: 'DocumentView',
    component: () => import('@/views/DocumentView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/document/:id/edit',
    name: 'DocumentEdit',
    component: () => import('@/views/DocumentEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state if not already done
  if (!authStore.isAuthenticated && localStorage.getItem('auth_token')) {
    authStore.initializeAuth()
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires admin privileges
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  // Redirect authenticated users away from guest-only pages
  if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
