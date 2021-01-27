export default {
    state: {
        modal_settings: {
            show: false,
            modalData: null,
            modalResult : null
        }
    },
    mutations: {
        SHOW_modal (state, data) {
            state.modal_settings.show = true;
            state.modal_settings.modalData = data;
        },
        CLOSE_modal (state) {
            state.modal_settings.show = false;
            state.modal_settings.modalData = null;
        },
        SET_modalResult (state, data) {
            state.modal_settings.modalResult = data;
        },
        CLEAR_modalResult (state) {
            state.modal_settings.modalResult = null;
        }
    },

    getters: {
        modal_settings: state => { return state.modal_settings }
    },
   
    actions: {

    },
   
}