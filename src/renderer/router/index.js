import Vue from 'vue'
import Router from 'vue-router'
import {
  publicRoutes,
  userRoutes
} from './routes'


Vue.use(Router)

export default new Router({
  routes: publicRoutes
})
