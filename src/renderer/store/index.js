// import { createPersistedState, createSharedMutations } from 'vuex-electron'
import Vue from 'vue'
import Vuex from 'vuex'
import actions from './comon/actions'
import mutations from './comon/mutations'
import modules from './modules'

console.log('mutations', mutations)
console.log('actions', actions)
Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  // plugins: [
  //   createPersistedState({
  //     whitelist: (mutation) => {
  //       console.log(mutation)
  //       return false
  //     },
  //     blacklist: (mutation) => {
  //       console.log(mutation)
  //       return true
  //     }
  //   }),
  //   createSharedMutations()
  // ],
  state: {
    room: null,
    user: null,
    userJoined: false,
    members: [],
    debug: false,
    fatal: null,
    replayRecording: null
  },
  mutations: {
    ...mutations
  },
  actions: {
    ...actions,
    hellow({ commit }, ploat) {
      console.log(21122, ploat)
    }
  },
  getters: {
    user: state => state.user,
    room: state => state.room,
    userJoined: state => state.userJoined,
    members: state => state.members,
    whiteboard_config: state => {
      if (state.room) {
        return state.room.services.whtieboard
      }
      return null
    },
    whiteboard_settings: state => {
      if (state.room) {
        return state.room.services.whiteboard.settings
      }
      return null
    },
    debug: state => state.debug,
    fatal: state => state.fatal,
    replayRecording: state => state.replayRecording
  },
  strict: process.env.NODE_ENV !== 'production'
})


