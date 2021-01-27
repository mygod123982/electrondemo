export default {
    state: {
        rtc_settings: {
            CLIENTS : []
        }
    },
    mutations: {

        UPDATE_rtc_CLIENTS (state, clients) {
            state.rtc_settings.CLIENTS = clients;
        }
    },

    getters: {
        rtc_CLIENTS: state => { return state.rtc_settings.CLIENTS }
    },
   
    actions: {

    },
   
}