import { joinRoom as enterRoom } from '@/api'
import { roomHistory } from '@/../electronStore'
import i18n from '@/lang'

function storeRoomToken(roomCode, token) {
    localStorage.setItem('USER_TOKEN', token)
    window.history.replaceState({}, document.title, "?code=" + encodeURIComponent(roomCode))
}

export default {
    async joinRoom({ commit }, params) {
        console.log('执行了')
        let data
        let req = await enterRoom(params).catch(err => {
            commit("SET_FATAL", {
                message: i18n.t('joinRoom.failed'),
                process: 'join_room',
                error: err
            })
            return
        })
        if (req && req.data) data = req.data
        else return commit("SET_FATAL", {
            message: i18n.t('joinRoom.failed'),
            process: 'join_room',
            error: 'enter room invalid return'
        })


        const me = data.me
        me.token = data.token || me.token

        commit("SET_USER", me)
        commit("SET_ROOM", Object.assign(data.room, { id: data.room.code, menu: JSON.parse(data.room.menu) }))
        commit("USER_JOIN")
        roomHistory.set(Object.assign({ me }, data.room))
        storeRoomToken(params.code, me.token)
        console.log('执行完毕了')
        return data.room.services
    },

    async logout({ commit }) {
        commit('USER_LEAVE')
        localStorage.removeItem('USER_TOKEN')
    },

    cleardatal({ commit }) {
        commit("SET_FATAL", null)
    }
}