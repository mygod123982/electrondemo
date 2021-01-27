import RtcClient from './RtcClient'
import AgoraRTC from 'agora-rtc-sdk'
// import EventBus from '@/utils/event-bus'
// import store from '@/store'

export default class AgoraRtcClient extends RtcClient {
    constructor(options) {
        super(options);
        this.options = options;
        AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.NONE);
    }

    async initialize(options) {
        if (options) {
            this.setOptions(options);
        }

        this.userToken = 'test';

        if (!this.userId || !this.userToken || !this.appId) {
            throw new Error(`error options: ${this.userId} ${this.userToken} ${this.appId}`)
        }

        this._client = AgoraRTC.createClient({
            mode: 'rtc',
            codec: "h264"
        });

        return new Promise((resolve, reject) => {
            this._client.init(this.appId, () => {
                this.handleEvents();
                resolve();
            }, err => {
                console.error('init client error: ', err)
                reject(err)
            });
        })
    }

    async join(roomId) {
        if (this.isJoined) {
            console.warn('duplicate RtcClient.join() observed');
            return;
        }

        this.roomId = roomId;

        return new Promise((resolve, reject) => {
            this._client.join(null, roomId, this.userId, () => {
                this.isJoined = true;
                // console.log('join room success: ', userId)
                resolve()
            }, err => {
                console.error('join room failed! ' + err);
                reject(err)
            });
        })
    }

    async leave() {
        if (!this.isJoined) {
            console.warn('leave() - please join() firstly');
            return;
        }

        await this.unpublish();

        return new Promise((resolve, reject) => {
            this._client.leave(() => {
                this.isJoined = false;
                resolve()
            }, reject)
        })
    }

    async publishStream(element) {
        this.elementId = element;
        
        await this.createLocalStream();
        await this.playStream();
        await this.publish()

    }

    async playStream() {
        this.localStream.play(this.options.elementId, {
            fit: 'cover'
        });
    }


    async publish() {
        if (!this.isJoined) {
            console.warn('publish() - please join() firstly');
            return;
        }
        if (this.isPublished) {
            console.warn('duplicate RtcClient.publish() observed');
            return;
        }

        return new Promise((resolve, reject) => {
            this._client.publish(this.localStream, err => {
                this.isPublished = false;
                console.error('failed to publish local stream ' + err);

                reject(err)
            });

            this.isPublished = true;

            resolve()
        })

    }

    async unpublish() {
        if (!this.isJoined) {
            console.warn('unpublish() - please join() firstly');
            return;
        }
        if (!this.isPublished) {
            console.warn('RtcClient.unpublish() called but not published yet');
            return;
        }

        return new Promise((resolve, reject) => {
            this._client.unpublish(this.localStream, reject);
            this.localStream = null;
            this.isPublished = false;
            resolve();
        })
    }

    async subscribe(stream, options) {
        return new Promise((resolve, reject) => {
            this._client.subscribe(stream, options, err => {
                reject(err)
            })
        })
    }

    async unsubscribe(stream, options) {
        return new Promise((resolve, reject) => {
            this._client.unsubscribe(stream, options, err => {
                reject(err)
            })
        })
    }

    async switchDevices(data) {
        // 已经发布的流，切换后不用重新发流。
        return new Promise((resolve, reject) => {
            
            if (data.cameraId) {
                this.localStream.switchDevice('video', data.cameraId, res => {
                    this.cameraId = data.cameraId;
                    resolve(res)
                }, err => {
                    reject(err)
                })
            }
            if (data.microphoneId) {
                this.localStream.switchDevice('audio', data.microphoneId, res => {
                    this.microphoneId = data.camermicrophoneIdaId;
                    resolve(res)
                }, err => {
                    reject(err)
                });
            }
        })
    }

    async createStream(options) {
        return AgoraRTC.createStream(options);
    }

    async createLocalStream(options) {
        options = options || this.options
        if (this.isScreenShare()) {
            this.localStream = AgoraRTC.createStream({
                streamID: this.userId, // TODO: generate stream id;
                audio: false,
                video: false,
                screen: true,
                screenAudio: true,
            });
        } else {
            this.localStream = AgoraRTC.createStream(options);
        }

        this.handleStreamEvents()

        return new Promise((resolve, reject) => {
            this.localStream.init(() => {
                resolve(this.localStream);
            }, err => {
                reject(err);
            })
        });
    }


    isPlaying(stream) {
        stream = stream || this.localStream;
        return stream.isPlaying()
    }

    muteAudio(stream) {
        stream = stream || this.localStream;
        stream.muteAudio()
        return this;
    }

    muteVideo(stream) {
        stream = stream || this.localStream;
        stream.muteAudio()
        return this;
    }

    unmuteAudio(stream) {
        stream = stream || this.localStream;
        stream.unmuteAudio()
        return this;
    }

    unmuteVideo(stream) {
        stream = stream || this.localStream;
        stream.unmuteVideo()
        return this;
    }

    async muteLocalAudio() {
        await this.localStream.muteAudio();
        this.isAudioMuted = true;
        return this
    }

    async unmuteLocalAudio() {
        await this.localStream.unmuteAudio();
        this.isAudioMuted = false;
        return this
    }

    async muteLocalVideo() {
        await this.localStream.muteVideo();
        this.isVideoMuted = true;
        return this
    }

    async unmuteLocalVideo() {
        await this.localStream.unmuteVideo();
        this.isVideoMuted = false;
        return this
    }

    toggleMuteLocalAudio() {
        if (this.localStream.isAudioOn()) return this.muteLocalAudio();
        return this.unmuteLocalAudio();
    }

    toggleMuteLocalVideo() {
        if (this.localStream.isVideoOn()) return this.muteLocalVideo();
        return this.unmuteLocalVideo();
    }

    /**
     * 恢复播放音视频
     * @param {Stream | null} stream 如果为 null，则恢复本地流
     */
    resumeStream(stream) {
        stream = stream || this.localStream;
        stream.unmuteVideo()
        return this;
    }

    resumeStreams() {
        this.resumeStream

        for (let stream of this.remoteStreams) {
            this.resumeStream(stream);
        }
        return this;
    }


    handleStreamEvents() {
        if (!this.isSubscriber) {
            return;
        }
        // "accessAllowed",
        // "accessDenied",
        // "stopScreenSharing",
        // "videoTrackEnded",
        // "audioTrackEnded",
        // "player-status-changed"


    }

    handleEvents() {
        if (!this.isSubscriber) {
            return;
        }

        const eventMap = {
            'stream-published': 'stream-published',
            'stream-added': 'stream-added',
            'stream-removed': 'stream-removed',
            'stream-subscribed': 'stream-subscribed',
            'peer-online': 'peer-join',
            'peer-leave': 'peer-leave',
            'error': 'error',
            'network-quality': 'network-quality',
            'exception': 'exception',
            'onTokenPrivilegeWillExpire': 'token-will-expire',
            'onTokenPrivilegeDidExpire': 'token-expired',
        };

        // for (let event in eventMap) {
        //     this._client.on(event, (args) => {
        //         const evtName = eventMap[event];
        //         if (evtName) {
        //             const data = Object.assign({}, args);
        //             data.userId = args.uid
        //             this.manager._handleEvents(evtName, data);
        //         }
        //     });
        // }



        // 新人加入房间/频道
        this._client.on('peer-online', event => {
            const userId = event.uid;
            console.log('peer-join ' + userId);

            if (!this.manager.isLocal(userId)) {
                const evtName = eventMap['peer-online'];

                // TODO: 有后端之后，这里需要移除，更换为 自家的 member
                this.manager.handleEvents(evtName, event)
            }
        });

        // fired when a remote peer is leaving the room
        this._client.on('peer-leave', evt => {
            // TODO: reset

            console.log('peer-leave ' + evt.uid);
            const stream = this.remoteStreams.find(stream => {
                return stream.streamId === evt.uid;
            });
            if (stream) {
                const id = stream.getId();
                stream.stop();
                this._client.unsubscribe(stream);
                this.remoteStreams = this.remoteStreams.filter(stream => {
                    return stream.getId() !== id;
                });
            }
            
        });

        // fired when a remote stream is added
        this._client.on('stream-added', evt => {
            console.log(evt.uid + ' stream added', evt);
            const remoteStream = evt.stream;


            // const userId = remoteStream.getUserId();
            // this.members.set(userId, remoteStream);

            if (this.manager.isLocalStream(remoteStream)) {
                console.log('unsubscribe localStream')
                // 不订阅自己的 streamId
                this._client.unsubscribe(remoteStream);
            } else {
                console.log('subscribe to this remote stream');
                this._client.subscribe(remoteStream);
            }
        });

        // fired when a remote stream has been subscribed
        this._client.on('stream-subscribed', evt => {

            const remoteStream = evt.stream;
            // const userId = remoteStream.getUserId();
            this.remoteStreams.push(remoteStream);

            // TODO: handle remote stream events

            const evtName = eventMap['stream-subscribed'];

            this.manager._handleEvents(evtName, evt)

            //TODO: 添加“摄像头未打开”遮罩
        });


        this._client.on('stream-removed', evt => {
            const remoteStream = evt.stream;
            const id = remoteStream.getId();
            remoteStream.stop();
            this.remoteStreams = this.remoteStreams.filter(stream => {
                return stream.getId() !== id;
            });

            const evtName = eventMap['stream-removed'];
            this.manager._handleEvents(evtName, evt)

            // TODO: remove camera view
        });


        this._client.on('mute-audio', evt => {
            console.log('mute audio', evt);
        });
        this._client.on('unmute-audio', evt => {
            console.log('unmute audio', evt);
        });
        this._client.on('mute-video', evt => {
            console.log('mute video', evt);
            // let streamId = this.members.get(evt.userId).getId();
        });
        this._client.on('unmute-video', evt => {
            console.log('unmute video', evt);
            // const stream = this.members.get(evt.userId);
        });
    }


    checkSupported() {
        return AgoraRtcClient.checkSupported();
    }
}