// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — Router (index.ts)
//
// All routes are lazy-loaded. Meta titles are set per-route.
// ─────────────────────────────────────────────────────────────────────────────
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNavigationLoadingStore } from '@/stores/navigationLoadingStore'
import { SITE_DESCRIPTION, SITE_NAME } from '@/config/site'
import { applySiteMeta } from '@/utils/siteMeta'

// Only Home is eager-loaded (it's the entry point)
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'EWA — Born of Beauty, Rooted in Heritage',
        layout: 'DefaultLayout',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: {
        title: 'About us — EWA',
        layout: 'DefaultLayout',
      },
    },
    {
      path: '/catalogue',
      name: 'catalogue',
      component: () => import('@/views/CatalogueView.vue'),
      meta: {
        title: 'Shop — EWA Catalogue',
        layout: 'DefaultLayout',
      },
    },
    {
      path: '/catalogue/:id',
      name: 'catalogue-detail',
      component: () => import('@/views/CatalogueDetailView.vue'),
      meta: {
        title: 'Product — EWA',
        layout: 'DefaultLayout',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Sign in — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: 'Register — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { title: 'Forgot password — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { title: 'Reset password — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallbackView.vue'),
      meta: { title: 'Signing in — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/checkout/return',
      name: 'checkout-return',
      component: () => import('@/views/CheckoutReturnView.vue'),
      meta: { title: 'Payment — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { title: 'Checkout — EWA', layout: 'DefaultLayout' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'My account — EWA', layout: 'DefaultLayout', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Page Not Found — EWA', layout: 'DefaultLayout' },
    },
  ],
})

// ── Global navigation guard: auth + loading ─────────────────────────────────
router.beforeEach((to, from) => {
  if (from.matched.length && to.fullPath !== from.fullPath) {
    useNavigationLoadingStore().start()
  }

  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

router.afterEach((to) => {
  const pageTitle = (to.meta.title as string) || `${SITE_NAME} — Catalogue`
  const noIndex =
    to.name === 'login' ||
    to.name === 'register' ||
    to.name === 'checkout' ||
    to.name === 'checkout-return' ||
    to.name === 'auth-callback' ||
    to.name === 'profile' ||
    to.name === 'forgot-password' ||
    to.name === 'reset-password'

  applySiteMeta({
    title: pageTitle,
    description: (to.meta.description as string | undefined) ?? SITE_DESCRIPTION,
    path: to.fullPath,
    noIndex,
  })

  void nextTick(() => {
    useNavigationLoadingStore().stop()
  })
})

router.onError(() => {
  useNavigationLoadingStore().stop()
})

export default router
