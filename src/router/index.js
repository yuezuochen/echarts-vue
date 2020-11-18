import Vue from 'vue'
import VueRouter from 'vue-router'
import ScreenPage from '@/views/ScreenPage'



Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:'/screen'
  },
  {
    path: '/screen',
    component: ScreenPage
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
