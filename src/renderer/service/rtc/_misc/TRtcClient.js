const TRTC = require('trtc-js-sdk');
import store from '@/store/index';
import RtcClient from './RtcClient'


export default class TRtcClient extends RtcClient {

  constructor(options) {
    super(options);
  }

  initialize(options) {
    if (options) {
      this.setOptions(options)
    }

    // TODO: validate
    if (!this.userId || !this.userToken || !this.appId) {
      throw new Error(`error options: ${this.userId} ${this.userToken} ${this.appId}`)
    }

    this._client = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: this.appId,
      userId: this.userId,
      userSig: this.userToken
    });

    if (this.isScreenShare()) {
      this._client.setDefaultMuteRemoteStreams(true);
    }

    this.handleEvents();
  }


 

  async join(roomId) {
    if (this.isJoined) {
      console.warn('duplicate RtcClient.join() observed');
      return;
    }

    this.roomId = roomId;

    try {
      await this._client.join({
        roomId: this.roomId
      });

      console.log('join room success');
      this.isJoined = true;

    } catch (e) {
      console.error('join room failed! ' + e);
    }
    //更新成员状态
    // let states = this._client.getRemoteMutedState();
    // for (let state of states) {
    //   if (state.audioMuted) {

    //   }
    //   if (state.videoMuted) {

    //   }
    // }
  }

  async publishStream(element) {
    this.elementId = element
    
    await this.createLocalStream()

    this.localStream.play(element);
  }

  async leave() {
    if (!this.isJoined) {
      console.warn('leave() - please join() firstly');
      return;
    }
    // ensure the local stream is unpublished before leaving.
    await this.unpublish();

    // leave the room
    await this._client.leave();

    this.localStream.stop();
    this.localStream.close();
    this.localStream = null;
    this.isJoined = false;
    // resetView();
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

    try {
      await this._client.publish(this.localStream);
    } catch (e) {
      console.error('failed to publish local stream ' + e);
      this.isPublished = false;
    }

    this.isPublished = true;
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

    await this._client.unpublish(this.localStream);
    this.isPublished = false;
  }

  async switchDevices(data) {
    if (data.cameraId) {
      await this.localStream.switchDevice('video', data.cameraId);
    }

    if (data.microphoneId) {
      await this.localStream.switchDevice('audio', data.microphoneId);
    }
  }

  async createLocalStream() {
    if (this.isScreenShare()) {
      this.localStream = TRTC.createStream({
        audio: false,
        screen: true,
      });
    } else {
      this.localStream = TRTC.createStream({
        audio: true,
        video: true,
        cameraId: this.cameraId,
        microphoneId: this.microphoneId,
        mirror: true
      });
    }

    // this.localStream.setVideoProfile('480p');
    // this.localStream.setVideoProfile({ width: 640, height: 480, frameRate: 15, bitrate: 900 /* kpbs */});
    try {
      // initialize the local stream and the stream will be populated with audio/video
      await this.localStream.initialize();
      console.log('initialize local stream success');

      this.localStream.on('player-state-changed', event => {
        console.log(event)
      });

      // 监听屏幕分享停止事件
      this.localStream.on('screen-sharing-stopped', event => {
        console.log('screen sharing was stopped', event);
      });

      await this.publish();

    } catch (e) {
      console.error('failed to initialize local stream - ' + e);
    }
  }




  muteLocalAudio() {
    this.localStream.muteAudio();
    return this
  }



  unmuteLocalAudio() {
    this.localStream.unmuteAudio();
    return this;
  }

  muteLocalVideo() {
    this.localStream.muteVideo();
    return this;
  }

  unmuteLocalVideo() {
    this.localStream.unmuteVideo();
    return this;
  }

  muteRemoteAudio(stream) {
    stream.muteAudio();
    return this;
  }

  resumeStreams() {
    this.localStream.resume();
    for (let stream of this.remoteStreams) {
      stream.resume();
    }
    return this;
  }

  handleEvents() {
    this._client.on('error', err => {
      console.error(err);
      alert(err);
      location.reload();
    });
    this._client.on('client-banned', err => {
      console.error('client has been banned for ' + err);
      // if (!isHidden()) {
      //   alert('您已被踢出房间');
      //   location.reload();
      // } else {
      //   document.addEventListener(
      //     'visibilitychange',
      //     () => {
      //       if (!isHidden()) {
      //         alert('您已被踢出房间');
      //         location.reload();
      //       }
      //     },
      //     false
      //   );
      // }
    });


    // fired when a remote peer is joining the room
    this._client.on('peer-join', evt => {
      const userId = evt.userId;
      console.log('peer-join ' + userId);

      if (!this.manager.isScreenShare(userId)) {
        // TODO: 有后端之后，这里需要移除，更换为 自家的 member
        store.commit('ADD_MEMBER', {
          id: userId,
          hasVideo: false
        })
      }
    });

    // fired when a remote peer is leaving the room
    this._client.on('peer-leave', evt => {
      // TODO: reset
      const userId = evt.userId;

      console.log('peer-leave ' + userId);
    });

    // fired when a remote stream is added
    this._client.on('stream-added', evt => {
      const remoteStream = evt.stream;
      // const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      this.members.set(userId, remoteStream);

      console.log(`remote stream added: `);
      if (this.manager.isScreenShare(remoteStream.getUserId())) {
        // 不订阅自己的屏幕分享
        this._client.unsubscribe(remoteStream);
      } else {
        console.log('subscribe to this remote stream');
        this._client.subscribe(remoteStream);
      }
    });

    // fired when a remote stream has been subscribed
    this._client.on('stream-subscribed', evt => {
      // console.log(evt.userId + ' stream subscribed');
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      this.remoteStreams.push(remoteStream);

      remoteStream.on('player-state-changed', event => {
        console.log(event)
      });

      store.commit('MEMBER_SUBSCRIBED_VIDEO', {
        id: remoteStream.getUserId(),
        videoId: id,
      });

      setTimeout(() => {
        // objectFit 为播放的填充模式，详细参考：https://trtc-1252463788.file.myqcloud.com/web/docs/Stream.html#play
        remoteStream.play(id, { objectFit: 'contain' });
      }, 1000)


      //TODO: 添加“摄像头未打开”遮罩
    });


    // fired when the remote stream is removed, e.g. the remote user called Client.unpublish()
    this._client.on('stream-removed', evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop();
      this.remoteStreams = this.remoteStreams.filter(stream => {
        return stream.getId() !== id;
      });

      // TODO: remove camera view
    });

    this._client.on('stream-updated', evt => {
      const remoteStream = evt.stream;
      let uid = this.getUidByStreamId(remoteStream.getId());

      console.log(
        'type: ' +
        remoteStream.getType() +
        ' stream-updated hasAudio: ' +
        remoteStream.hasAudio() +
        ' hasVideo: ' +
        remoteStream.hasVideo() +
        ' uid: ' +
        uid
      );
    });

    this._client.on('mute-audio', evt => {
      console.log(evt.userId + ' mute audio');
    });
    this._client.on('unmute-audio', evt => {
      console.log(evt.userId + ' unmute audio');
    });
    this._client.on('mute-video', evt => {
      console.log(evt.userId + ' mute video');
      // let streamId = this.members.get(evt.userId).getId();
    });
    this._client.on('unmute-video', evt => {
      console.log(evt.userId + ' unmute video');
      // const stream = this.members.get(evt.userId);
    });
  }

  showStreamState(stream) {
    console.log('has audio: ' + stream.hasAudio() + ' has video: ' + stream.hasVideo());
  }

  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
  }
}
