import { createRouter, createWebHistory } from 'vue-router'
import Home from "../views/Home.vue"
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/catalogue-home',
      name: 'catalogue-home',
    component: () => import('../views/CatalogueHome.vue'),
     meta: { layout: 'DefaultLayout' }
     
    },
    {
      path: '/',
      name: 'home',
      component: Home
    },
     {
      path: '/catalogue-page/:id',
      name: 'catalogue-page',
       component: () => import('../views/CataloguePage.vue'),
    },
  ]
})

export default router