
const state = {
  contentText: {},
  inprocessing: false,
  requestInfo: {},

  RoomInfo: {}
}

const getters = {
  meetingFormText: (state) => state.contentText,
  inprocessing: (state) => state.inprocessing,
  requestInfo: (state) => state.requestInfo,
  RoomInfo: (state) => state.RoomInfo
}

const mutations = {
  SET_INFOS(state, info) {
    const { contentText, inprocessing, requestInfo } = info
    state.contentText = contentText
    state.inprocessing = inprocessing
    state.requestInfo = requestInfo
  },

  SET_ROOMINFO(state, info) {
    state.RoomInfo = info
  }
}

const actions = {
  setMeetingInfo({ commit }, infos) {
    const contentText = []
    console.log(infos)
    const keys = Reflect.ownKeys(infos.result)
    keys.forEach(key => {
      const value = infos.result[key]
      contentText.push({
        key,
        value
      })
    })
    const inprocessing = 'token' in infos
    const requestInfo = {
      token: infos.token,
      cookie: infos.cookie,
      method: infos.method,
      url: infos.url
    }

    commit('SET_INFOS', {
      contentText,
      inprocessing,
      requestInfo
    })

    return Promise.resolve()
  },

  setRoomToMeeting({ commit }, infos) {
    commit('SET_ROOMINFO', infos)
    return Promise.resolve()
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}