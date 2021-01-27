import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import i18n from './lang/index'
import MeetingRoom from '@/service/meetingRoom/MeetingRoom'
import EventBus from '@/utils/event-bus'
import { getUserAgentDetails } from '@/utils/utils'

import moment from 'vue-moment'
import linkify from 'vue-linkify'
// import vConsole from 'vconsole';
import * as Sentry from '@sentry/browser'
import { Vue as VueIntegration } from '@sentry/integrations'

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production')
  Sentry.init({
    dsn: 'https://242da21c0bb247b485942dbe91a8a9ad@sentry.menco.cn/7',
    integrations: [new VueIntegration({
      Vue,
      attachProps: true
    })],
  })

/* 导入scss样式 */
import '@/assets/styles/element-variables.scss'
import '@/assets/styles/index.scss'
import '@/assets/icons/index.js'
/* 导入 element ui 相关 */
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en'

Vue.use(ElementUI)

Vue.directive('linkified', linkify)

Vue.prototype.userAgent = getUserAgentDetails()

Vue.prototype.EventBus = EventBus

Vue.prototype.meetingRoom = new MeetingRoom()

try {
  Vue.prototype.rtc = Vue.prototype.meetingRoom.createRtcManager()

  Vue.prototype.im = Vue.prototype.meetingRoom.createRtmManager()

  Vue.prototype.whiteboard = Vue.prototype.meetingRoom.createWhiteboard({
    preloadDynamicPPT: true,
    handToolKey: ' ',
    deviceType: ('ontouchstart' in window || navigator.maxTouchPoints) ? "touch" : "desktop",
    appIdentifier: '1400/NeEOiACVumwVyw'
  })
} catch (error) {
  console.log(error)
}
Vue.use(moment)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
