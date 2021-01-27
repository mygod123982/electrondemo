import AgoraRtcClient from './AgoraRtcNgClient'
// import AgoraRTC from "agora-rtc-sdk-ng"
// import config from '../config'
import {
    loadDriverConfig,
    generateUserToken
} from '../tool'
import store from '@/store'
import i18n from '@/lang'
import {
    publishMedia
} from "@/api"


export default class Manager {

    constructor() {

        this.initialized = false

        this.user = null // 自家的 user
        this.channelId = null

        this.meetingRoom = null

        this.subscriberClient = null
        this.mainPublisher = null
        this.screenPublisher = null
        this.clients = []
        this.remotes = []

        this.userDevices = null //store user devices on first pick

        const driverConfig = loadDriverConfig()

        this.driver = driverConfig.driver
        this.driverOptions = driverConfig.options
    }

    setMeetingRoom(meetingRoom) {
        this.meetingRoom = meetingRoom
    }

    setChannelId(channelId) {
        this.channelId = '' + channelId
    }

    setUser(user) {
        this.user = user

        store.subscribe(async (mutation) => {
            if (mutation.type === 'SET_USER_ROLES') {
                if (!/presenter|moderator/.test(store.getters.user.roles.join(''))) {
                    await this.unpublishSecondaryPublishers()
                }
                if (!/presenter/.test(store.getters.user.roles.join(''))) {
                    await this.unpublishScreenPublishers()
                }
                if (!/presenter|moderator/.test(store.getters.user.roles.join(''))) {
                    await this.lowerPublishersVideoResolution()
                }
            }
        })
    }

    async generateRtcUserToken() {
        // TODO: 请求后端做签名
        const sign = generateUserToken()
        return sign.userSig
    }

    generateRtcUser() {
        // return options.tags ? Math.round(Math.random() * 10) : this.user.id;
        return Math.floor(Math.random() * 10000)
    }

    createRtcClient(options) {
        const driver = loadDriverConfig()

        options = Object.assign(options, driver.options)

        if (driver.driver === 'agora') {
            return new AgoraRtcClient(options)
        }
    }

    _pushClient(client, tags) {
        client.tags = tags
        this.clients.push(client)
    }

    _deleteClient(client) {
        const _index = this.findClientIndex(client.uid)
        if (_index > 0) {
            this.clients.splice(_index, 1)
        }
        if (!!this.screenPublisher && this.screenPublisher.uid === client.uid) {
            this.screenPublisher = null
        }
    }

    async addClient(options) {
        options = options || {}
        console.log(options, 'mangerNg-addClient')

        const tags = options.tags

        this.uid = options.uid || this.generateRtcUser(options)

        options.channelId = this.channelId

        let client = this.createRtcClient(options)
        client.setManager(this)
        await client.initialize(options)

        this._pushClient(client, tags)

        if (options.tags.includes('subscriber')) {
            if (this.subscriberClient) throw 'subscriber already exists'
            this.subscriberClient = client
        }

        if (options.tags.includes('publisher') && options.tags.includes('main')) {
            if (this.mainPublisher) throw 'mainPublisher already exists'
            this.mainPublisher = client
        }

        if (options.type === "screen") {
            if (this.screenPublisher) throw 'screenPublisher already exists'
            this.screenPublisher = client
        }

        await client.join()

        return client
    }

    async addMainClient(options) {
        options = options || {}
        options.uid = this.user.services.rtc[0].uid
        options.token = this.user.services.rtc[0].token
        options.elementId = 'video_' + this.user.services.rtc[0].uid
        options.tags = ['subscriber', 'publisher', 'main']
        options.isSubscriber = true
        options.isMainPublisher = true

        return await this.addClient(options)
    }

    async addScreenShareClient(options) {

        if (this.screenPublisher) {
            await this.removeClient(this.screenPublisher)
        }

        const publisher = await this.meetingRoom.addRtcMediaPublisher("screen").catch(err => {
            console.error(err)
            return
        })

        options = options || {}
        options.uid = publisher.uid
        options.token = publisher.token
        options.tags = ['publisher', 'screenshare']
        options.type = 'screen'
        options.audio = options.audio || false
        options.isSubscriber = false
        options.isMainPublisher = false

        return await this.addClient(options)
    }

    async addSecondaryClient(options) {
        const clientNumber = this.clients.filter(client => client.type === 'cam').length + 1

        const publisher = await this.meetingRoom.addRtcMediaPublisher('cam' + clientNumber).catch(err => {
            console.error(err)
            return
        })

        options = options || {}
        options.uid = publisher.uid
        options.token = publisher.token
        options.tags = ['publisher']
        options.type = 'cam'
        options.isSubscriber = false
        options.isMainPublisher = false

        return await this.addClient(options)
    }

    updateMemberStream(stream) {
        store.commit('UPDATE_MEMBER_RTCSTREAM', stream)
    }

    removeMemberStream(stream) {
        store.commit('REMOVE_MEMBER_RTCSTREAM', stream.uid)
    }

    async removeClient(client) {
        if (!(client instanceof AgoraRtcClient)) {
            client = this.findClient(client)
        }
        return await this._deleteClient(client)
    }

    async addToRemotes(userStream) {
        userStream.options = this.meetingRoom.getRtcAttributes(userStream.uid)
        this.remotes.push(userStream)
    }

    async removeFromRemotes(uid) {
        const index = this.remotes.findIndex(remote => remote.uid === uid)
        if (index >= 0) {
            this.remotes.splice(index, 1)
        }
    }

    findClient(uid) {
        return this.clients.find(c => c.uid === uid)
    }

    findClientIndex(uid) {
        return this.clients.findIndex(c => c.uid === uid)
    }

    findClientByStreamId(streamId) {
        return this.clients.find(c => !!c.localStream && c.localStream.getId() === streamId)
    }

    findClientByElementId(elementId) {
        return this.clients.find(c => c.elementId === elementId)
    }

    findClientIndexByElementId(elementId) {
        return this.clients.findIndex(c => c.elementId === elementId)
    }

    isScreenShare(uid) {
        const client = this.findClient(uid)
        return client && client.isScreenShare()
    }

    getClients() {
        return this.clients
    }

    getVideoClients() {
        return this.getClients().filter(c => {
            return !!c.video
        })
    }

    getOtherClients_cameraIds(c_uid) {
        return this.clients.filter(c => c.uid !== c_uid && c.cameraId).map(c2 => c2.cameraId)
    }

    getOtherClients_microphoneIds(c_uid) {
        return this.clients.filter(c => c.uid !== c_uid && c.microphoneId).map(c2 => c2.microphoneId)
    }

    getRemotes() {
        return this.remotes
    }

    async getsubscriberClient() {
        return this.subscriberClient
    }

    async getMainPublisherClient() {
        return this.mainPublisher
    }

    async getScreenPublisherClient() {
        return this.screenPublisher
    }

    async unpublishSecondaryPublishers() {
        await this.clients.forEach(async client => {
            if (!/main|screen/.test(client.tags.join(':'))) {
                await client.leave()
            }
        })
        return "done"
    }

    async unpublishScreenPublishers() {
        if (this.screenPublisher) {
            await this.screenPublisher.leave()
        }
        return "done"
    }

    async lowerPublishersVideoResolution() {
        await this.clients.forEach(async client => {
            await client.lowerVideoEncoderConfig()
        })
        return "done"
    }

    async mutePublishersAudio() {
        await this.clients.forEach(async client => {
            await client.unpublishAudio()
        })
        return "done"
    }

    userChooseDevice(types, c_uid, isMainPublisher) {
        if (!types) {
            return null
        }

        return new Promise(resolve => {
            // var that = this;
            store.commit("SHOW_modal", {
                action: "ChooseMediaDevice",
                title: i18n.t('devicePicker.hardwareSettings'),
                data: {
                    clients: types,
                    client_uid: c_uid,
                    isMainPublisher: isMainPublisher
                }
            })
            const subscriber = store.subscribe((mutation) => {
                if (mutation.type === 'CLOSE_modal') {
                    resolve(store.getters.modal_settings.modalResult)
                    store.commit("CLEAR_modalResult")
                    subscriber()
                }
            })
        })
    }

    async request_rtcMediaPublisher(tag) {
        const options = {}
        options.token = this.user.token
        options.code = store.getters.room.id
        options.tag = tag || null
        const request = await publishMedia(options)
        return request.data || null
    }

    /**
     * 是否是自己发出的 stream
     */
    isLocalStream(uid) {
        const client = this.findClient(uid)

        return !!client
    }

    isLocal(uid) {
        const client = this.findClient(uid)

        return !!client
    }

    async destruct() {
        await this.clients.forEach(async client => {
            await client.leave()
        })
        this.clients.length = 0
        this.remotes.length = 0
        this.subscriberClient = null
        this.mainPublisher = null
        this.screenPublisher = null
        this.initialized = false
        this.meetingRoom.rtcManager = null
        return "done"
    }
}