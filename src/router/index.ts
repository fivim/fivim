import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView
    }
  ]
})

export default router
