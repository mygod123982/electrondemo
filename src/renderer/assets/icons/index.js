import Vue from 'vue'
import Icon from './index.vue'

// register globally
Vue.component('icon', Icon)

const req = require.context('./svg', false, /\.svg$/)

const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
