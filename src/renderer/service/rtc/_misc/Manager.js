import RtcClient from './RtcClient'
// import { createRtcClient } from './tool'
import AgoraRtcClient from './AgoraRtcClient'
import AgoraRTC from 'agora-rtc-sdk'
import config from '../config'
import {
    loadDriverConfig,
    generateUserToken
} from '../tool'
// import store from '@/store'
// import EventBus from '@/utils/event-bus'


export default class Manager {

    constructor() {
        this.user = null; // 自家的 user
        this.channelId = null;

        this.subscriberClient = null;
        this.mainPublisher = null;
        this.clients = [];

        const driverConfig = loadDriverConfig();

        this.driver = driverConfig.driver;
        this.driverOptions = driverConfig.options
    }

    setChannelId(channelId) {

        this.channelId = '' + channelId;
    }

    setUser(user) {
        this.user = user;
    }

    async generateRtcUserToken() {
        // TODO: 请求后端做签名
        const sign = generateUserToken();
        return sign.userSig
    }

    generateRtcUser() {
        // return options.tag ? Math.round(Math.random() * 10) : this.user.id;
        return Math.floor(Math.random() * 10000);
    }

    createRtcClient(options) {
        const driver = loadDriverConfig();

        options = Object.assign(options, driver.options)

        if (driver.driver === 'agora') {
            return new AgoraRtcClient(options);
        }
    }

    _pushClient(client, tag) {
        client.tag = tag;
        this.clients.push(client);
    }

    _deleteClient(client) {
        const _index = this.findClientIndexByElementId(client.elementId);
        console.log(_index);
        if (_index > 0) {
            this.clients.splice(_index, 1);
        }
    }

    async addClient(options) {
        options = options || {};

        const tag = options.tag;

        const uid = options.uid || this.generateRtcUser(options);

        const userToken = options.token;
        options.userToken = userToken;
        options.userId = uid;

        options.channelId = this.channelId;

        let client = this.createRtcClient(options);
        client.setManager(this)
            .initialize(options);

        this._pushClient(client, [tag]);

        if (options.tag.includes('subscriber')) {
            if (this.subscriberClient) throw 'subscriber already exists';
            this.subscriberClient = client;
        }

        if (options.tag.includes('publisher') && options.tag.includes('main')) {
            if (this.mainPublisher) throw 'mainPublisher already exists';
            this.mainPublisher = client;
        }

        await client.join(this.channelId)

        return client
    }

    async addMainClient(options) {
        options = options || {};
        options.uid = this.user.rtc_uid;
        options.token = this.user.rtc_token;
        options.elementId = this.user.rtc_uid+"_video";
        options.tag = ['subscriber','publisher', 'main'];
        options.video = true;
        options.audio = true;
        options.isSubscriber = true;
        options.isMainPublisher = true;

        return await this.addClient(options);
    }

    async addSubscriberClient(options) {
        options = options || {};
        options.elementId = "subscriber_client";
        options.tag = ['subscriber'];
        options.type = 'subscriber';
        options.isSubscriber = true;
        options.video = false;
        options.audio = false;

        return await this.addClient(options);
    }

    async addMainPublisherClient(options) {
        options = options || {}
        options.tag = ['publisher', 'main'];
        options.elementId = "mainPublisher_client";
        options.video = true;
        options.audio = true;
        options.isMainPublisher = true;
        return await this.addClient(options);
    }

    async addScreenShareClient(options) {
        options = options || {}
        options.tag = ['publisher', 'screenshare'];
        options.type = 'screen';
        options.isSubscriber = false;

        return await this.addClient(options);
    }

    async switchDevices(client, data) {
        if (client instanceof RtcClient) {
            return await client.switchDevices(data);
        } else {
            client = this.findClient(client);
            return await client.switchDevices(data);
        }
    }

    async createLocalStream(client, options) {
        if (client instanceof RtcClient) {
            return await client.createLocalStream(options);
        } else {
            client = this.findClient(client);
            return await client.createLocalStream(options);
        }
    }

    async removeClient(client) {
        if (client instanceof RtcClient) {
            await client.leave();
        } else {
            client = this.findClient(client);
            await client.leave();
        }
        await this._deleteClient(client);
    }

    findClient(uid) {
        return this.clients.find(c => c.userId === uid);
    }

    findClientIndex(uid) {
        return this.clients.findIndex(c => c.userId === uid);
    }

    findClientByStreamId(streamId) {
        return this.clients.find(c => !!c.localStream && c.localStream.getId() === streamId);
    }

    findClientByElementId(elementId) {
        return this.clients.find(c => c.elementId === elementId);
    }

    findClientIndexByElementId(elementId) {
        return this.clients.findIndex(c => c.elementId === elementId);
    }


    isScreenShare(uid) {
        const client = this.findClient(uid);

        return client && client.isScreenShare()
    }

    getClients() {
        return this.clients;
    }

    getVideoClients() {
        return this.getClients().filter(c => {
            return !!c.video;
        })
    }

    getClients_cameraIds() {
        return this.clients.map(c => {
            return c.localStream ? c.localStream.cameraId : null;
        })
    }

    getClients_microphoneIds() {
        return this.clients.map(c => {
            return c.localStream ? c.localStream.microphoneId : null;
        })
    }

    async getsubscriberClient() {
        return this.subscriberClient;
    }

    async getMainPublisherClient() {
        return this.mainPublisher;
    }

    /**
     * 是否是自己发出的 stream
     */
    isLocalStream(stream) {
        const client = this.findClientByStreamId(stream.getId());

        // console.log('isLocalStream', stream, client, !!client)

        return !!client;
    }

    isLocal(uid) {
        const client = this.findClient(uid);

        return client !== null;
    }

    async _handleEvents(event, args) {
        // console.log(`[EVENT] ${event} `, args)

        const userId = event.userId;

        if (event === 'peer-join') { // 新人加入房间/频道

            // console.log('peer-join ' + userId);

            // store.commit('ADD_MEMBER', {
            //     id: userId,
            //     hasVideo: false
            // })
        } else if (event === 'peer-leave') {

            //
        } else if (event === 'stream-added') {
            const remoteStream = args.stream;

            // this.members.set(userId, remoteStream);

            if (this.isLocalStream(userId)) {
                // 不订阅自己的 stream
                this._client.unsubscribe(remoteStream);
            } else {
                // console.log('subscribe to this remote stream');
                this._client.subscribe(remoteStream);
            }
        } else if (event === 'stream-subscribed') {
            const remoteStream = args.stream;

            remoteStream.on('player-state-changed', event => {
            console.log(event)
            });

            // const vid = 'video_' + remoteStream.streamId

            // console.log('stream-subscribed', vid)

            // store.commit('MEMBER_SUBSCRIBED_VIDEO', {
            //     id: vid,
            //     videoId: vid + '',
            // });

            // setTimeout(() => {
            //     remoteStream.play(vid + '', {
            //         fit: 'contain'
            //     });
            // }, 2000)


            //TODO: 添加“摄像头未打开”遮罩
        }
    }


    // drive specific methods
    getCameras() {
        if (config.driver === 'agora') {
            return new Promise((resolve, reject) => {
                AgoraRTC.getDevices(devices => {
                    var videoDevices = devices.filter(function(device) {
                        return device.kind === "videoinput";
                    });
                    resolve(videoDevices)
                }, err => {
                    reject(err)
                })
            })

        }
        return AgoraRTC.getCameras();
    }

    getMicrophones() {
        if (config.driver === 'agora') {
            return new Promise((resolve, reject) => {
                AgoraRTC.getDevices(devices => {
                    var audioDevices = devices.filter(function(device) {
                        return device.kind === "audioinput";
                    });
                    resolve(audioDevices)
                }, err => {
                    reject(err)
                })
            })

        }
        return AgoraRTC.getMicrophones()
    }

    getDevices() {
        if (config.driver === 'agora') {
            return new Promise((resolve, reject) => {
                AgoraRTC.getDevices(devices => {
                    resolve(devices)
                }, err => {
                    reject(err)
                })
            })

        }

        return AgoraRTC.getDevices()
    }

    getDefaultDevices() {
        return new Promise((resolve, reject) => {
            let defaultDevices = {};
            this.getDevices().then(devices => {
                for (let device of devices) {
                    if (!defaultDevices.camera && device.kind === "videoinput") {
                        defaultDevices.camera = device;
                    }

                    if (!defaultDevices.microphone && device.kind === "audioinput") {
                        defaultDevices.microphone = device;
                    }
                }

                resolve(defaultDevices)
            }).catch(error => reject(error))
        })
    }
    
    createStream(options) {
        options.streamID = options.streamID || Math.floor(Math.random() * 10000);
        return AgoraRTC.createStream(options)
    }
}