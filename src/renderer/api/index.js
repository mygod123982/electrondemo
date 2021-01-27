import request from '@/utils/request'

export function createRoom(data) {
    return request({
        url: '/room',
        method: 'post',
        data
    })
}

export function updateRoom(data) {
    return request({
        url: '/room',
        method: 'put',
        data
    })
}

export function startRoom(data) {
    return request({
        url: '/room',
        method: 'put',
        data
    })
}

export function enrollRoom(data) {
    return request({
        url: '/room/enroll',
        method: 'post',
        data
    })
}

export function joinRoom(data) {
    return request({
        url: '/room/enter',
        method: 'post',
        data
    })
}

export function record() {
    return request({
        url: '/room/record',
        method: 'post'
    })
}

export function assignPresenter(data) {
    return request({
        url: '/room/assign_presenter',
        method: 'post',
        data
    })
}

export function removePresenter(data) {
    return request({
        url: '/room/remove_presenter',
        method: 'post',
        data
    })
}

export function assignModerator(data) {
    return request({
        url: '/room/assign_moderator',
        method: 'post',
        data
    })
}

export function removeModerator(data) {
    return request({
        url: '/room/remove_moderator',
        method: 'post',
        data
    })
}

export function publishMedia(data) {
    return request({
        url: '/room/media_publisher',
        method: 'post',
        data
    })
}


export function getUploadToken(data) {
    return request({
        url: '/room/upload_token',
        data
    })
}


