// import config from '../config'
import {
    loadDriverConfig
} from '../tool'
// import store from '@/store'
import AgoraIM from './AgoraIM'
// import EventBus from '@/utils/event-bus'

// import {
//     assignPresenter,
//     removePresenter,
//     assignModerator,
//     removeModerator
// } from "@/api";

export default class Manager {


    constructor() {
        this.initialized = false;

        const driverConfig = loadDriverConfig();

        this.driver = driverConfig.driver;
        this.driverOptions = driverConfig.options;

        this.uid = null;
        this.token = null;

        this.client = null;
        this.meetingRoomChannel = null;

        this.meetingRoom = null;
    }

    async initialize(options) {
        this.options = options;

        this.uid = this.user.services.im.uid+'';
        this.token = this.user.services.im.token;

        this.client = new AgoraIM(this.driverOptions);
        this.client.setManager(this);
        await this.clientLogin();

        this.meetingRoomChannel = await this.createChannel(options.channel_id+'');
        this.meetingRoom.handleRtmChannelEvents(this.meetingRoomChannel);
        return this.meetingRoomChannel;
    }

    setMeetingRoom(meetingRoom) {
        this.meetingRoom = meetingRoom;
    }

    setUser(user) {
        this.user = user;
    }

    clientLogin() {
        return new Promise(resolve => {
            this.client.login(this.uid, this.token, () => {
                resolve();
            })
        })
    }

    async createChannel(channelId) {
        const channel = await this.client.createChannel(channelId);
        await channel.join();
        return channel;
    }

    async sendTextMessageToRoomChannel(message) {
        return await this.client.sendTextMessageToChannel(message, this.roomChannel);
    }

    getClient() {
        return this.client;
    }

    async sendTextMessageToMeetingRoomChannel(message) {
        return await this.client.sendTextMessageToChannel(message, this.meetingRoomChannel);
    }

    async destruct() {
        await this.client.logout();
        this.client = null;
        this.meetingRoomChannel = null;
        this.initialized = false;
        this.meetingRoom.rtmManager = null;
        this.meetingRoom.rtmChannel = null;
        return "done";
    }
}