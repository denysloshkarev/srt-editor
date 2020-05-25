import Vue from 'vue'
import VueRouter from 'vue-router'
import VideoSelector from '../views/VideoSelector.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'VideoSelector',
    component: VideoSelector
  },
  {
    path: '/editor',
    name: 'SRTEditor',
    component: () => import(/* webpackChunkName: "srtEditor" */ '../views/SRTEditor.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
