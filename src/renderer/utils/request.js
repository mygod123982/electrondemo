import axios from 'axios';
import store from '@/store'


const service = axios.create({
    baseURL: window.location.hostname === 'meety.menco.cn' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_DEV_BASE_API,
    timeout: 50000
})

service.interceptors.request.use(
    config => {
        if (store.getters.room) {
            if (!config.params) config.params = {}
            config.params.code = store.getters.room.code;
            config.params.token = store.getters.user.token;

            if (config.method === 'get') {
                if (!config.params) config.params = {}
                config.params.code = store.getters.room.code;
                config.params.token = store.getters.user.token;
            } else {
                if (!config.data) config.data = {}
                config.data.code = store.getters.room.code;
                config.data.token = store.getters.user.token;
            }
        }
        
        // if (store.getters.token) {
        //     config.headers['Authorization'] = 'Bearer ' + store.getters.token
        // }
        return config
    },
    error => {
        console.log('[REQUEST ERROR]: ', error) // for debug
        Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    response => response,
    error => {
        console.log('[HTTP REQUEST ERROR]: ' + error, error.response) // for debug

        if (error.response) {
            // The request was made and the server responded with a status code
        } else if (error.request) {
            // The request was made but no response was received

        } else {
            // Something happened in setting up the request that triggered an Error
        }

        return Promise.reject(error)
    }
)

export default service
