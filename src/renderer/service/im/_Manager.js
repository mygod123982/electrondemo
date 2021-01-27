// import config from '../config'
import {
    loadDriverConfig
} from '../tool'
// import store from '@/store'
import AgoraIM from './AgoraIM'
import EventBus from '@/utils/event-bus'

// import {
//     assignPresenter,
//     removePresenter,
//     assignModerator,
//     removeModerator
// } from "@/api";

export default class Manager {


    constructor() {
        const driverConfig = loadDriverConfig();

        this.driver = driverConfig.driver;
        this.driverOptions = driverConfig.options;

        this.client = null;
        this.roomChannel = null;

        this.meetingRoom = null;
    }

    setMeetingRoom(meetingRoom) {
        this.meetingRoom = meetingRoom;
    }

    setUser(user) {
        this.user = user;
    }

    async createClient(options) {

        options = options || {};

        const driver = loadDriverConfig();

        options = Object.assign(options, this.driverOptions);

        if (driver.driver === 'agora') {
            this.client = await new AgoraIM(options);
            this.client.setManager(this);
            return this.client;
        }
    }

    updateRoomChannelAttributes(attributes, options) {
        options = options || {};
        return this.client.addOrUpdateChannelAttributes(this.roomChannel.channelId, attributes, options);
    }

    deleteRoomChannelAttributesByKeys(attributes, options) {
        options = options || {};
        return this.client.deleteChannelAttributesByKeys(this.roomChannel.channelId, attributes, options);
    }

    clearRoomChannelAttributes(options) {
        options = options || {};
        return this.client.clearChannelAttributes(this.roomChannel.channelId, options);
    }

    setLocalUserAttributes() {
        return this.client.setLocalUserAttributes({
            "user_id": this.user.id,
            "username": this.user.name,
            "im_uid": this.user.im_uid,
            "rtc_uids": this.user.rtc_profiles.map(r => {
                return r.uid
            }).join(",")
        });
    }

    async login() {
        return new Promise(resolve => {
            this.client.login(this.user.services.im.uid+'', this.user.services.im.token, async () => {
                await this.onlogin();
                await resolve();
            })
        })
    }

    async logout() {
        this.client.logout();
    }

    async onlogin() {
        // await this.setLocalUserAttributes();
    }

    async sendMessageToPeer(message, peer) {
        const result = await this.client.sendMessageToPeer(message, peer);
        return result;
    }

    async createRoomChannel(channelId) {
        const channel = await this.client.createChannel(channelId);
        this.roomChannel = channel;

        // var channelAttributes = await this.getChannelAttributes(channelId);
        // channelAttributes.presenter_id = channelAttributes.presenter_id ? channelAttributes.presenter_id.value : null;
        // channelAttributes.moderator_ids = channelAttributes.moderator_ids ? channelAttributes.moderator_ids.value : null;

        // // update channel presenter
        // if (this.user.isPresenter) {
        //     channelAttributes.presenter_id = channelAttributes.presenter_id || this.user.id;
        // }
        // // update channel moderator
        // if (this.user.isModerator) {
        //     if (!channelAttributes.moderator_ids || channelAttributes.moderator_ids === "") {
        //         channelAttributes.moderator_ids = this.user.id
        //     } else {
        //         if (!channelAttributes.moderator_ids.split(",").includes(this.user.id)) {
        //             channelAttributes.moderator_ids += ("," + this.user.id)
        //         }
        //     }
        // }


        // // get channel attributes and sync to state
        // await this.updateAndSyncRoomChannelAttributes(channelAttributes);

        // join channel
        await channel.join();

        // get channel members and attributes
        // const member_uids = await this.getRoomChannelMembers();
        // member_uids.forEach(uid => {
        //     this.syncMemberToState(uid);
        // });

        this.channel_eventHandler(channel);

        return channel;
    }

    // async syncChannelAttributesToState(channelAttribute) {

    //     var roles = {
    //         presenter_id: null,
    //         moderator_ids: []
    //     };

    //     if (channelAttribute.moderator_ids && channelAttribute.moderator_ids.value) {
    //         roles.moderator_ids = await channelAttribute.moderator_ids.value.split(",");
    //     } else {
    //         roles.moderator_ids = [];
    //     }

    //     if (channelAttribute.presenter_id && channelAttribute.presenter_id.value) {
    //         roles.presenter_id = channelAttribute.presenter_id.value === "" ? null : channelAttribute.presenter_id.value;
    //     } else {
    //         roles.presenter_id = null;
    //     }

    //     await store.commit("UPDATE_ROOM_ROLES", roles);
    // }

    // async updateAndSyncRoomChannelAttributes(channelAttributeUpdates) {
    //     await this.updateRoomChannelAttributes(channelAttributeUpdates);
    //     const channelAttributes = await this.getRoomChannelAttributes();
    //     await this.syncChannelAttributesToState(channelAttributes);
    // }

    // async makeMemberPresenter(member_id) {
    //     const member = store.getters.members.find(m => m.id === member_id);

    //     if (member) {
    //         assignPresenter({
    //             token: this.user.token,
    //             code: store.getters.room.id,
    //             member_id: member.id
    //         }).then(() => {
    //             this.updateAndSyncRoomChannelAttributes({
    //                 "presenter_id": member.id
    //             });
    //         })
    //     }
    // }

    // async makeMemberModerator(member_id) {
    //     const member = store.getters.members.find(m => m.id === member_id);

    //     if (member) {
    //         assignModerator({
    //             token: this.user.token,
    //             code: store.getters.room.id,
    //             member_id: member.id
    //         }).then(async () => {
    //             var channelAttributes = await this.getRoomChannelAttributes();
    //             var moderator_ids = channelAttributes.moderator_ids ? channelAttributes.moderator_ids.value : "";
    //             if (!moderator_ids.split(",").includes(member.id)) {
    //                 moderator_ids += ("," + member.id);
    //                 await this.updateAndSyncRoomChannelAttributes({
    //                     "moderator_ids": moderator_ids
    //                 });
    //             }
    //         })
    //     }
    // }

    // async unmakeMemberModerator(member_id) {
    //     const member = store.getters.members.find(m => m.id === member_id);

    //     if (member) {
    //         removeModerator({
    //             token: this.user.token,
    //             code: store.getters.room.id,
    //             member_id: member.id
    //         }).then(async () => {
    //             var channelAttributes = await this.getRoomChannelAttributes();
    //             var moderator_ids = channelAttributes.moderator_ids ? channelAttributes.moderator_ids.value : "";
    //             moderator_ids = moderator_ids.split(",").filter(m => m !== member.id).join(",");
    //             if (moderator_ids.length > 0) {
    //                 await this.updateAndSyncRoomChannelAttributes({
    //                     "moderator_ids": moderator_ids
    //                 });
    //             } else {
    //                 await this.deleteRoomChannelAttributesByKeys(["moderator_ids"]);
    //             }
    //         })
    //     }
        
    // }

    // async syncMemberToState(uid) {
    //     const attr = await this.getUserAttributes(uid);
    //     store.commit('ADD_MEMBER', {
    //         id: attr.user_id,
    //         im_uid: attr.im_uid,
    //         rtc_uids: attr.rtc_uids.split(",").map(id => {
    //             return Number(id)
    //         }),
    //         name: attr.username,
    //         rtc_streams: {}
    //     })
    // }

    async sendTextMessageToRoomChannel(message) {
        return await this.client.sendTextMessageToChannel(message, this.roomChannel);
    }

    getClient() {
        return this.client;
    }

    getRoomChannel() {
        return this.roomChannel;
    }

    getRoomChannelMembers() {
        return this.roomChannel.getMembers();
    }

    getChannelAttributes(channelId) {
        return this.client.getChannelAttributes(channelId);
    }

    getRoomChannelAttributes() {
        return this.getChannelAttributes(this.roomChannel.channelId);
    }

    getUserAttributes(im_uid) {
        return this.client.getUserAttributes(im_uid);
    }

    getLocalUserAttributes() {
        return this.getUserAttributes(this.user.im_uid);
    }

    channel_eventHandler(channel) {
        if (channel.channelId === this.roomChannel.channelId) {

            // channel event handlers
            // channel.on('MemberJoined', uid => {
            //     this.syncMemberToState(uid);
            // });

            // channel.on('MemberLeft', uid => {
            //     store.commit('REMOVE_MEMBER_BY_IM_UID', uid);
            // });

            // channel.on('AttributesUpdated', updatedAttr => {
            //     console.log(updatedAttr);
            //     this.syncChannelAttributesToState(updatedAttr);
            // });

            channel.on('ChannelMessage', (message, memberId) => {
                this.channel_messageHandler(message, memberId)
            });
        }
    }

    channel_messageHandler(message, memberId) {
        if (message.messageType === "TEXT") {
            message.im_uid = memberId;
            EventBus.$emit('im-message', message);
        }
    }
}