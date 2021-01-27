const axios = require('axios');

export function convertPpt(pptUrl) {
    return axios.get('https://converter.menco.cn/ppt', {
        params: {
            url: pptUrl,
            type: 'image'
        }
    })
}

export function convertPdf(pptUrl) {
    return axios.get('https://converter.menco.cn/pdf', {
        params: {
            url: pptUrl
        }
    })
}