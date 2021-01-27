// import AgoraRTC from "agora-rtc-sdk-ng"
import AgoraRtcEngine from 'agora-electron-sdk'
import {
    getUserAgentDetails
} from '@/utils/utils'
import i18n from '@/lang'
import {
    Notification
} from 'element-ui'

export default class AgoraRtcClient {

    constructor(options) {
        this.options = options
        this.callId = null
        this.screenDisplays = []
        this.screenWindow = []


        this.type = 'cam' // cam, screen
        this.tags = [] // 区分功能作用的 tag

        this.clientRole = 2

        this.appId = null

        this.uid = null // rtc 用户 id
        this.token = null // user 准入 token

        this.channelId = null

        this.cameraId = null
        this.cameraFacingMode = null
        this.microphoneId = null

        this.videoEncoderConfig = null
        this.videoTrack = null
        this.isVideoPublished = false

        this.audioTrack = null
        this.isAudioPublished = false

        this.setOptions(options)

        this.isJoined = false

        this.localStream = null
        this.remoteStreams = []

        this._client = null

        this.elementId = null // stream 播放器挂载的 element id

        this.manager = null

        this.isSubscriber = false //
        this.isMainPublisher = false //

        this.userAgent = getUserAgentDetails()

        // this.video_codec = null

        // AgoraRTC.setLogLevel(2);


    }

    setManager(manager) {
        this.manager = manager
        return this
    }

    setOptions(options) {
        for (let key in options) {
            this[key] = options[key]
        }
        this.uid = options.uid ? +options.uid : null
        return this
    }

    async initialize(options) {
        if (options) {
            this.setOptions(options)
        }
        const rtcEngine = new AgoraRtcEngine()
        this._client = rtcEngine
        const logLevel = process.env.NODE_ENV === 'production' ? 0x000e : 0x080f
        if (!this.uid || !this.appId) {
            throw new Error(`error options: ${this.uid} ${this.token} ${this.appId}`)
        }

        rtcEngine.initialize(this.appId)
        rtcEngine.setChannelProfile(1)

        await this.makeHost()

        this.handleEvents()
        // rtcEngine.setLogFile()
        rtcEngine.setLogFilter(logLevel)
        return this._client
    }

    async makeHost() {
        if (this.clientRole === 1) {
            return
        }
        await this._client.setClientRole(1)
        this.clientRole = 1
        if (this.type === 'screen') {
            // this._client.setLowStreamParameter({
            //     width: 848,
            //     height: 480,
            //     framerate: 15,
            //     bitrate: 610,
            // })
            this._client.setRemoteDefaultVideoStreamType(1)
            console.log('low bitrate for screen set')
        }
        await this._client.enableDualStreamMode(true)

    }

    async join() {
        if (this.isJoined) {
            console.warn('duplicate RtcClient.join() observed')
            return
        }
        const result = await this._client.joinChannel(this.token, this.channelId, 'electron', this.uid)
        if (result === 0) {
            this.isJoined = true
            this.callId = await this._client.getCallId()
            return this.isJoined
        } else {
            throw new Error(`joining failed for:  ${this.channelId} ${this.token} ${this.uid}`)
        }
    }

    async createMicrophoneAudioTrack(microphoneId) {
        this.microphoneId = microphoneId || this.microphoneId
        if (this.microphoneId === null) {
            const result = await this.manager.userChooseDevice(["audio"], this.uid)
            if (result !== null) {
                this.microphoneId = result.microphoneId
            }
        }
        if (this.microphoneId) {
            return AgoraRTC.muteLocalAudioStream(true)
        }
    }

    async createCameraVideoTrack(cameraId) {
        this.cameraId = cameraId || this.cameraId
        if (this.cameraId === null) {
            const result = await this.manager.userChooseDevice(["video"], this.uid)
            if (result !== null) {
                this.cameraId = result.cameraId
                this.videoEncoderConfig = result.videoEncoderConfig
                this.cameraFacingMode = result.cameraFacingMode
            }
        }
        if (this.cameraId) {
            return AgoraRTC.enableLocalVideo(true)
        }
    }

    // async createCameraVideoMicrophoneAudioTrack(cameraId, microphoneId) {
    //     this.cameraId = cameraId || this.cameraId
    //     this.microphoneId = microphoneId || this.microphoneId
    //     var chooseDeviceArr = []

    //     if (this.cameraId === null) {
    //         chooseDeviceArr.push('video')
    //     }

    //     if (this.microphoneId === null) {
    //         chooseDeviceArr.push('audio')
    //     }

    //     if (chooseDeviceArr.length > 0) {
    //         const result = await this.manager.userChooseDevice(chooseDeviceArr, this.uid, this.isMainPublisher)
    //         if (result !== null) {
    //             this.cameraId = result.cameraId
    //             this.videoEncoderConfig = result.videoEncoderConfig
    //             this.microphoneId = result.microphoneId
    //             this.cameraFacingMode = result.cameraFacingMode
    //         }
    //     }

    //     var _tracks = {
    //         videoTrack: null,
    //         audioTrack: null
    //     }

    //     if (this.cameraId) {
    //         _tracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
    //             cameraId: this.cameraId,
    //             encoderConfig: this.videoEncoderConfig || "360p",
    //             facingMode: this.cameraFacingMode
    //         })
    //     }

    //     if (this.microphoneId) {
    //         _tracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
    //             microphoneId: this.microphoneId
    //         })
    //     }

    //     return _tracks
    // }

    async changeVideoCaptureDevice() {

        if (!this.videoTrack) {
            return
        }
        // mobile devices do not support binding multiple cameras at once. 
        // unpublish first to release device before binding a new one
        if (!this.userAgent.desktop) {
            await this.unpublishVideo()
            const previous_cameraId = this.cameraId
            this.cameraId = null
            await this.publishVideo()
            if (!this.videoTrack) {
                this.cameraId = previous_cameraId
                this.publishVideo()
            }
        } else {
            const result = await this.manager.userChooseDevice(["video"], this.uid)
            if (result !== null) {
                if (!!result.cameraId && this.cameraId !== result.cameraId) {
                    this.cameraId = result.cameraId
                    await this.videoTrack.setDevice(this.cameraId)
                }
                if (!!result.videoEncoderConfig && this.videoEncoderConfig !== result.videoEncoderConfig) {
                    this.videoEncoderConfig = result.videoEncoderConfig
                    await this.videoTrack.setEncoderConfiguration(this.videoEncoderConfig)
                }
            }
        }
    }

    lowerVideoEncoderConfig() {
        if (!/360p/.test(this.videoEncoderConfig)) {
            this.videoEncoderConfig = "360p"
            if (this.videoTrack) {
                this.videoTrack.setEncoderConfiguration(this.videoEncoderConfig || "360p")
            }
        }
    }

    async getScreenDisplaysInfo() {
        if (this.screenDisplays.length !== 0) {
            return this.screenDisplays
        } else {
            return this.client.getScreenDisplaysInfo()
        }
    }
    async getScreeWindowInfo() {
        if (this.screenWindow.length !== 0) {
            return this.screenWindow
        } else {
            return this.client.getScreenWindowsInfo()
        }
    }

    async createScreenTrack() {

        return await AgoraRTC.createScreenVideoTrack({
            encoderConfig: "720p_2",
        }, 'auto')
    }

    async leave() {
        if (!this.isJoined) {
            console.warn('leave() - please join() firstly')
            return
        }

        if (this.isVideoPublished) {
            // console.log('video is still published!!! unpublishing');
            try {
                await this.unpublishVideo()
            } catch (err) {
                console.log(err, 'error unpublishing video')
            }

        }

        if (this.isAudioPublished) {
            // console.log('audio is still published!!! unpublishing');
            try {
                await this.unpublishAudio()
            } catch (err) {
                console.log(err, 'error unpublishing audio')
            }

        }

        // console.log("leaving");

        return new Promise((resolve, reject) => {
            this._client.leave(() => {
                this.isJoined = false
                resolve()
            }, reject)
        })
    }

    async publish(track) {
        if (!this.isJoined) {
            console.warn('publish() - please join() firstly')
            return
        }
        if (track) {
            return this._client.publish(track)
        } else {
            return this._client.publish()
        }
    }

    async unpublish(track) {
        if (!this.isJoined) {
            console.warn('publish() - please join() firstly')
            return
        }
        if (track) {
            return this._client.unpublish(track)
        }
    }

    async publishScreen() {
        if (this.isVideoPublished) {
            console.warn('duplicate publish(video) observed')
            return
        }
        if (!this.videoTrack) {
            if (this.type === "screen") {
                const _tracks = await this.createScreenTrack().catch(error => {
                    if (error.code && error.code === 'PERMISSION_DENIED') {
                        Notification({
                            title: i18n.t('notifications.screenshare_access_denied.title'),
                            message: i18n.t('notifications.screenshare_access_denied.message'),
                            type: 'error'
                        })
                    } else if (error.code && error.code === 'NOT_SUPPORT') {
                        Notification({
                            title: i18n.t('notifications.screenshare_not_supported.title'),
                            message: i18n.t('notifications.screenshare_not_supported.message'),
                            type: 'error'
                        })
                    } else {
                        Notification({
                            title: i18n.t('notifications.screenshare_access_denied.title'),
                            message: i18n.t('notifications.screenshare_access_denied.message'),
                            type: 'error'
                        })
                    }


                    this.leave()
                    return
                })
                this.videoTrack = _tracks[0] || _tracks
                this.audioTrack = _tracks[1] || null
                if (!this.videoTrack) return
            }
        }
        await this.publishVideo()
        if (this.audioTrack) {
            await this.publishAudio()
        }
    }

    async publishVideoAudio() {
        if (this.isVideoPublished || this.isAudioPublished) {
            console.warn('duplicate publish(video/audio) observed')
            return
        }
        if (!this.videoTrack && !this.audioTrack) {
            const _tracks = await this.createCameraVideoMicrophoneAudioTrack().catch(error => {
                console.log(error)
                this.leave()
                return
            })
            this.videoTrack = _tracks.videoTrack
            this.audioTrack = _tracks.audioTrack

            if (!this.videoTrack && !this.audioTrack) return
        }

        if (this.audioTrack && this.videoTrack) {
            this.publish([this.audioTrack, this.videoTrack]).then(() => {
                this.isVideoPublished = true
                this.isAudioPublished = true
                this.manager.meetingRoom.informMediaPublished(this.uid, 'video')
                this.manager.meetingRoom.informMediaPublished(this.uid, 'audio')
                this.audioTrack.once("track-ended", evt => {
                    console.warn("unexpected track end.", evt)
                })
            }).catch(async err => {
                console.log('publish error', err)
                if (this.audioTrack.isPlaying) {
                    await this.audioTrack.stop()
                }
                await this.audioTrack.close()
                this.audioTrack = null

                if (this.videoTrack.isPlaying)
                    await this.videoTrack.stop()
                await this.videoTrack.close()
                this.videoTrack = null
                if (this.type === "screen")
                    this.leave()
            })
        } else {
            if (this.audioTrack) {
                await this.publishAudio()
            }
            if (this.videoTrack) {
                await this.publishVideo()
            }
        }
    }

    async publishVideo() {
        if (this.isVideoPublished) {
            console.warn('duplicate publish(video) observed')
            return
        }
        if (!this.videoTrack) {
            if (this.type === "cam") {
                this.videoTrack = await this.createCameraVideoTrack()
                if (!this.videoTrack) return
            }
        }

        this.publish(this.videoTrack).then(() => {
            this.isVideoPublished = true
            this.manager.meetingRoom.informMediaPublished(this.uid, 'video')
            this.videoTrack.once("track-ended", evt => {
                console.warn("unexpected track end.", evt)
                if (this.isVideoPublished) this.unpublishVideo()
            })
        }).catch(async err => {
            console.log('publish error', err)
            if (this.videoTrack.isPlaying)
                await this.videoTrack.stop()
            await this.videoTrack.close()
            this.videoTrack = null
            if (this.type === "screen")
                this.leave()
        })
    }

    async publishAudio() {
        if (this.isAudioPublished) {
            console.warn('duplicate publish(audio) observed')
            return
        }
        if (!this.audioTrack) {
            if (this.type === "cam") {
                this.audioTrack = await this.createMicrophoneAudioTrack()
                if (!this.audioTrack) return
            }
        }

        this.publish(this.audioTrack).then(() => {
            this.isAudioPublished = true
            this.manager.meetingRoom.informMediaPublished(this.uid, 'audio')
            this.audioTrack.once("track-ended", evt => {
                console.warn("unexpected track end.", evt)
                // if (this.isAudioPublished) this.unpublishAudio();
            })
        }).catch(async err => {
            console.error(err)
            if (this.audioTrack.isPlaying) {
                await this.audioTrack.stop()
            }
            await this.audioTrack.close()
            this.audioTrack = null
        })
    }

    async unpublishVideo() {
        if (!this.isVideoPublished) {
            console.warn('video is not published')
            return
        }

        if (this.videoTrack.isPlaying) {
            await this.videoTrack.stop()
        }

        return this.unpublish(this.videoTrack).then(async () => {
            this.isVideoPublished = false
            this.manager.meetingRoom.informMediaUnpublished(this.uid, 'video')
            this.videoTrack.off("track-ended")

            await this.videoTrack.close()
            this.videoTrack = null
            if (this.type === "screen") {
                this.leave()
            }
        })
    }

    async unpublishAudio() {
        if (!this.isAudioPublished) {
            console.warn('audio is not published')
            return
        }

        if (this.audioTrack.isPlaying) {
            await this.audioTrack.stop()
        }

        return this.unpublish(this.audioTrack).then(async () => {
            this.isAudioPublished = false
            this.manager.meetingRoom.informMediaUnpublished(this.uid, 'audio')
            await this.audioTrack.close()
            this.audioTrack = null
        })
    }

    async toggleLocalVideo() {
        if (this.isVideoPublished) {
            return await this.unpublishVideo()
        }
        return await this.publishVideo()
    }

    async toggleLocalAudio() {
        if (this.isAudioPublished) {
            return await this.unpublishAudio()
        }
        return await this.publishAudio()
    }

    handleEvents() {
        if (!this.isSubscriber) {
            return
        }

        this._client.on('user-left', user => {
            if (this.manager.isLocal(user.uid)) {
                // console.log("removing local client");
                this.manager.removeClient(user.uid)
                return
            }
            // console.log("is remote!!!!!!");
            this.manager.removeFromRemotes(user.uid)
        })

        this._client.on("user-published", async (user, mediaType) => {
            // console.log("user-published********************",user)
            if (this.manager.isLocal(user.uid)) {
                return
            }
            // console.log("is remote!!!!!!");
            this._client.subscribe(user, mediaType).then(() => {
                // console.log("subscribed",user, mediaType);
                // this.manager.updateMemberStream(user);


                if (!this.manager.remotes.find(s => s.uid === user.uid)) {
                    this.manager.addToRemotes(user)
                    this._client.setStreamFallbackOption(user.uid, 1).then(() => {
                        // console.log(`${user} stream fallback set`)
                    })
                }


            })

        })

        this._client.on("user-unpublished", async (user) => {
            if (this.manager.isLocal(user.uid)) {
                // console.log("user-unpublished is local!!!!!!");
                return
            }
            // console.log(user, mediaType);
            if (!user.audioTrack && !user.videoTrack) {
                this.manager.removeFromRemotes(user.uid)
            }
            // this.manager.updateMemberStream(user);
        })

        this._client.on("user-mute-updated", async (user) => {
            if (this.manager.isLocal(user)) {
                // console.log("is local!!!!!!");
                return
            }
            // console.log("is remote!!!!!!");
            // console.log("user-mute-updated", user.uid);
            // this.manager.updateMemberStream(user);
        })

        this._client.on("channel-media-relay-event", async event => {
            console.log("channel-media-relay-event", event)
        })

        this._client.on("channel-media-relay-state", async (state, code) => {
            console.log("channel-media-relay-state", state, code)
        })

        this._client.on("connection-state-change", async event => {
            if (!/CONNECTING|CONNECTED/.test(event))
                console.log("connection-state-change", event)
        })

        this._client.on("stream-type-changed", async (user, streamType) => {
            console.log(`${user} changed to stream type ${streamType}`)
        })

        this._client.on("exception", async event => {
            console.log("exception", event)
        })

    }

    destroy() {
        if (this.isMainPublisher || this.isSubscriber)
            return
        this.manager.removeClient(this)
    }

}

