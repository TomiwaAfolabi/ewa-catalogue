// ─────────────────────────────────────────────────────────────────────────────
// EWA Catalogue — Router (index.ts)
//
// All routes are lazy-loaded. Meta titles are set per-route.
// Navigation guards are scaffolded and ready for auth once backend is live.
// ─────────────────────────────────────────────────────────────────────────────
import { createRouter, createWebHistory } from 'vue-router'

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
    // ── Scaffold: add protected routes here when auth is ready ───────────────
    // {
    //   path: '/account',
    //   name: 'account',
    //   component: () => import('@/views/AccountView.vue'),
    //   meta: { title: 'My Account — EWA', layout: 'DefaultLayout', requiresAuth: true },
    // },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Page Not Found — EWA', layout: 'DefaultLayout' },
    },
  ],
})

// ── Global navigation guard: update document title ───────────────────────────
router.beforeEach(to => {
  document.title = (to.meta.title as string) || 'EWA'

  // ── Scaffold: uncomment once auth store is implemented ───────────────────
  // const authStore = useAuthStore()
  // if (to.meta.requiresAuth && !authStore.isLoggedIn) {
  //   return { name: 'login', query: { redirect: to.fullPath } }
  // }
})

export default router
