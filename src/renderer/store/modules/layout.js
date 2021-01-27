export default {
    state: {
        Layout_settings: {
            showSidePanel: window.screen.width <= 768 ? false : true,
            showUserList: true,
            showChatroom: false,
            showContentBoard: true
        }
        
    },
    mutations: {
        TOGGLE_SidePanel (state) {
            state.Layout_settings.showSidePanel = !state.Layout_settings.showSidePanel;
        },
        TOGGLE_SidePanel_UserList (state) {
            state.Layout_settings.showUserList = !state.Layout_settings.showUserList;
        },
        TOGGLE_SidePanel_Chatroom (state) {
            state.Layout_settings.showChatroom = !state.Layout_settings.showChatroom;
        },
        TOGGLE_MainPanel_ContentBoard (state) {
            state.Layout_settings.showContentBoard = !state.Layout_settings.showContentBoard;
        },
        HIDE_SidePanel (state) {
            state.Layout_settings.showSidePanel = false;
        },
    },

    getters: {
        Layout_settings: state => { return state.Layout_settings }
    },
   
    actions: {

    },
   
}