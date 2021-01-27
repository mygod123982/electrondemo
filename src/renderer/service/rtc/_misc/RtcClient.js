

export default class RtcClient {
    constructor(options) {
        this.type = 'cam'; // cam, screen
        this.tag = []; // 区分功能作用的 tag
        // this.name = '';

        this.appId = null;
        this.userId = null; // rtc 用户 id
        this.userToken = null; // user 准入 token

        this.cameraId = null;
        this.microphoneId = null;

        this.setOptions(options);

        this.isJoined = false;
        this.isPublished = false;

        this.localStream = null;
        this.remoteStreams = [];

        this.members = new Map();

        this._client = null;

        this.elementId = null; // stream 播放器挂载的 element id

        this.manager = null;
        
        this.isSubscriber = false; // 
        this.isMainPublisher = false; // 
    }

    // initialize(options) {

    // }

    setManager(manager) {
        this.manager = manager;
        return this;
    }


    setOptions(options) {

        for (let key in options) {
            this[key] = options[key];
        }

        this.userId = options.userId ? +options.userId : null

        return this;
    }

    isScreenShare() {
        return this.type === 'screen';
    }


    checkSupported() {

    }

}