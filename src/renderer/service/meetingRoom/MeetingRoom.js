import store from '@/store'
import RtcClientManager from '@/service/rtc/ManagerNg'
import Whiteboard from '@/service/whiteboard/Whiteboard'
import ImManager from '@/service/im/Manager'
import WsManager from './WsManager'
import Message from './Message'
import {
    Notification,
    MessageBox
} from 'element-ui'
import i18n from '@/lang'
// import Vue from 'vue'
// import EventBus from '@/utils/event-bus';


export default class MeetingRoom {

    constructor() {
        this.options = null

        this.id = null
        this.code = null
        this.name = null

        this.members = []

        this.recorder = null

        this.wsManager = null
        this.wsConnection = null

        this.rtmManager = null
        this.rtmChannel = null
        this.rtmChannelMessages = []

        this.rtcManager = null
        this.whiteboard = null

        this.ready = false
        this.idleTime = 0
        this.userIdle = false

        this.currentPip = null

        this.turnOnDevicesOnFirstJoin = false
    }

    createRtcManager(options) {
        options = options || {}
        this.rtcManager = new RtcClientManager(options)
        this.rtcManager.setMeetingRoom(this)
        return this.rtcManager
    }

    createRtmManager(options) {
        options = options || {}
        this.rtmManager = new ImManager(options)
        this.rtmManager.setMeetingRoom(this)
        return this.rtmManager
    }

    createWhiteboard(options) {
        options = options || {}
        return new Whiteboard(options)
    }

    createWsManager() {
        this.wsManager = new WsManager({
            url: window.location.hostname === 'meety.menco.cn' ? process.env.VUE_APP_WS_API : process.env.VUE_APP_DEV_WS_API
        })
        this.wsManager.setMeetingRoom(this)
    }

    async initialize(options) {
        this.options = options
        this.id = options.code
        this.code = options.code
        this.name = options.name || "TempRoom"
        this.logout_url = options.logout_url
        this.auto_recording = options.auto_recording

        this.createWsManager()

        await this.wsManager.connect()


        // idle check
        setTimeout(() => {
            console.log('starting idle checks')
            this.idleInterval = setInterval(() => {
                this.idleTime += 1
                if (this.idleTime >= 45) {
                    this.userIdle = true
                    this.informUserIdleStatus()
                }
            }, 1000 * 60)

            window.addEventListener("keydown", () => {
                this.idleTime = 0
                if (this.userIdle) {
                    this.userIdle = false
                    this.informUserIdleStatus()
                }
            })

            window.addEventListener("mousemove", () => {
                this.idleTime = 0
                if (this.userIdle) {
                    this.userIdle = false
                    this.informUserIdleStatus()
                }
            })
        }, 1000 * 60 * 45)

    }

    async onWsConnectSuccess() {
        this.ready = false

        const resp = await this.wsManager.wsRequest('join', {
            token: store.getters.user.token,
            code: store.getters.room.id
        })

        this.members.length = 0

        for (let m of resp) {
            const existed = this.members.find(i => i.id === m.id)
            if (existed) continue
            this.members.push(m)
            if (m.id === store.getters.user.id) {
                store.commit('SET_USER_ROLES', m.roles)
            }
        }

        await this.joinRoom()
        this.ready = true
    }

    async joinRoom() {

        if (!this.rtmManager.initialized) {
            await this.initRTM(this.options)
        }

        // await this.initMainContent()

        return "done"

    }

    async initMainContent() {
        if (!this.rtcManager.initialized) {
            await this.initRTC(this.options)
        }
        await this.initWhiteboard(this.options)
        return "done"
    }

    syncMyUserState() {
        const _me = this.findMember_me()
        store.commit('SET_USER_ROLES', _me.roles)
        store.commit('SET_USER_RTC_PUBLISHERS', _me.services.rtc)
    }

    async initRTM(options) {
        if (!options.services.im) {
            return
        }

        this.rtmManager.setUser(store.getters.user)
        await this.rtmManager.initialize(options.services.im)
        this.rtmChannel = this.rtmManager.meetingRoomChannel
        this.rtmManager.initialized = true
    }

    async initRTC(options) {
        if (!options.services.rtc) {
            return
        }

        if (this.options.services.rtc.recorders) {
            // this.recorder = this.options.services.rtc.recorders.find(recorder => recorder.status === "on");
            // Vue.set(this, "recorder", this.options.services.rtc.recorders.find(recorder => recorder.status === "on"))
            this.recorder = this.options.services.rtc.recorders.find(recorder => recorder.status === "on")
        }

        this.rtcManager.setUser(store.getters.user)

        await this.rtcManager.setChannelId(options.services.rtc.channel_id)
        await this.rtcManager.addMainClient()
        this.rtcManager.initialized = true
    }

    async initWhiteboard(options) {
        if (!options.services.whiteboard) {
            return
        }
        // await this.whiteboard.join(options.services.whiteboard.channel_id, options.services.whiteboard.token);
        // await this.whiteboard.display("netless-whiteboard");
    }

    refreshMeetingRoom(members, presenters, moderators) {
        this.members = members || this.members
        this.presenters = presenters || this.presenters
        this.moderators = moderators || this.moderators
    }

    addOrUpdateMember(member) {
        member.id = member.id || member.member_id
        const index = this.members.findIndex(m => m.id === member.id)
        if (index >= 0) {
            this.members[index] = member
        } else {
            this.members.push(member)
        }
    }

    removeMember(member) {
        member.id = member.id || member.member_id
        const index = this.members.findIndex(m => m.id === member.id)
        if (index >= 0) {
            this.members.splice(index, 1)
        } else {
            console.warn(member.id + " remove member failed: not found")
        }
    }

    addMemberRole(member, role) {
        member.id = member.id || member.member_id

        if (role === 'presenter') {
            const presenter = this.findMember_presenter()
            if (presenter) {
                this.removeMemberRole(presenter, 'presenter')
            }
        }

        const index = this.members.findIndex(m => m.id === member.id)
        if (index >= 0) {
            if (!this.members[index].roles.includes(role)) {
                this.members[index].roles.push(role)
                if (member.id === store.getters.user.id) {
                    store.commit('SET_USER_ROLES', this.members[index].roles)
                }
            }
        } else {
            console.warn(member.id + " member promote failed: not found")
        }
    }

    addMemberMediaPublisher(publisher) {

        if (publisher.member_id === store.getters.user.id) {
            store.commit('UPDATE_USER_RTC_PUBLISHER', publisher)
        }

        const index = this.members.findIndex(m => m.id === publisher.member_id)

        if (index >= 0) {
            const rtc_index = this.members[index].services.rtc.findIndex(rtc => rtc.uid === publisher.uid)
            if (rtc_index < 0) {
                this.members[index].services.rtc.push(publisher)
            } else {
                this.members[index].services.rtc[rtc_index] = publisher
            }
        } else {
            console.warn(publisher.member_id + " add publisher failed: member not found")
        }
    }

    findMember_presenter() {
        return this.members.find(member => {
            return member.roles.includes("presenter")
        })
    }

    findMemberBy_imUid(im_uid) {
        return this.members.find(member => member.services.im.uid + '' === im_uid + '')
    }

    findMemberBy_id(id) {
        return this.members.find(member => member.id === id)
    }

    findMember(member) {
        member.id = member.id || member.member_id || member
        return this.findMemberBy_id(member.id)
    }

    getRtcAttributes(rtc_uid) {
        const member = this.members.find(member => {
            const index = member.services.rtc.findIndex(rtc => rtc.uid === rtc_uid)
            return index >= 0
        })

        var rtc = member.services.rtc.find(rtc => rtc.uid === rtc_uid)
        rtc.member_id = member.id
        rtc.member_name = member.name
        return rtc
    }

    findMember_me() {
        return this.members.find(member => member.id === store.getters.user.id)
    }

    async removeMemberRole(member, role) {
        member.id = member.id || member.member_id
        const index = this.members.findIndex(m => m.id === member.id)
        if (index >= 0) {
            const role_index = this.members[index].roles.findIndex(set_role => set_role === role)
            if (role_index >= 0) {
                this.members[index].roles.splice(role_index, 1)
                if (member.id === store.getters.user.id) {
                    store.commit('SET_USER_ROLES', this.members[index].roles)
                    // if (!store.getters.user.roles.includes('presenter')) {
                    //     await this.rtcManager.unpublishSecondaryPublishers();
                    // }
                    // if (!/presenter|moderator/.test(store.getters.user.roles.join(''))) {
                    //     console.log("also removing hq videos!!!!");
                    //     await this.rtcManager.lowerPublishersVideoResolution();
                    // }
                }
            }
        } else {
            console.warn(member.id + " member promote failed: not found")
        }
    }

    async muteIfIsMe(member) {
        member.id = member.id || member.member_id
        if (store.getters.user.id === member.id) {
            this.muteMe()
        }
    }

    async muteMe() {
        await this.rtcManager.mutePublishersAudio()
        Notification({
            message: i18n.t('notifications.self_muted.message'),
            type: 'info'
        })
    }

    toggleRecord() {
        this.recording = !this.recording
    }

    handleWsConnectionEvents(connection) {
        connection.on('connect', () => {
            this.wsConnection = connection
            this.onWsConnectSuccess()
        })

        connection.on('member_joined', (member) => {
            this.addOrUpdateMember(member)
            if (/moderator/.test(store.getters.user.roles.join(':'))) {
                Notification({
                    message: member.name + i18n.t('notifications.member_joined.message'),
                    type: 'info'
                })
            }
        })

        connection.on('member_left', (member) => {
            member = this.findMember(member)
            this.removeMember(member)
            if (/moderator/.test(store.getters.user.roles.join(':'))) {
                Notification({
                    message: member.name + i18n.t('notifications.member_left.message'),
                    type: 'info'
                })
            }
        })

        connection.on('moderator_assigned', (member) => {
            member = this.findMember(member)
            this.addMemberRole(member, 'moderator')
            if (/moderator/.test(store.getters.user.roles.join(':'))) {
                Notification({
                    message: member.name + i18n.t('notifications.moderator_assigned.message'),
                    type: 'info'
                })
            }
        })

        connection.on('moderator_removed', (member) => {
            member = this.findMember(member)
            this.removeMemberRole(member, 'moderator')
            if (/moderator/.test(store.getters.user.roles.join(':'))) {
                Notification({
                    message: member.name + i18n.t('notifications.moderator_removed.message'),
                    type: 'info'
                })
            }
        })

        connection.on('presenter_assigned', (member) => {
            member = this.findMember(member)
            this.addMemberRole(member, 'presenter')
            Notification({
                message: member.name + i18n.t('notifications.presenter_assigned.message'),
                type: 'info'
            })
        })

        connection.on('presenter_removed', (member) => {
            this.removeMemberRole(member, 'presenter')
        })

        connection.on('media_publisher_added', (publisher) => {
            // console.log('media publisher added**' , publisher)
            this.addMemberMediaPublisher(publisher)
        })

        connection.on('client_mute_member', (member) => {
            member.id = member.id || member.member_id
            if (store.getters.user.id === member.id) {
                this.muteMe()
            }
        })

        connection.on('client_mute_all_members', (data) => {
            if (data.originator_member_id === store.getters.user.id) return
            if (!data.mute_presenter && /presenter/.test(store.getters.user.roles.join(':'))) return
            this.muteMe()
        })

        connection.on('whiteboard_settings_updated', (whiteboard_settings) => {
            store.commit('UPDATE_ROOM_WHITEBOARD_SETTINGS', whiteboard_settings)
            // Notification({
            //     message: i18n.t('notifications.recorder_ended.message'),
            //     type: 'info'
            // });
        })

        connection.on('recorder_started', (recorder) => {
            // console.log(recorder);
            this.recorder = recorder
            Notification({
                message: i18n.t('notifications.recorder_started.message'),
                type: 'info'
            })
        })

        connection.on('recorder_stopped', () => {
            // console.log(recorder);
            // Vue.set(this, "recorder", null);
            this.recorder = null
            Notification({
                message: i18n.t('notifications.recorder_ended.message'),
                type: 'info'
            })
        })

        connection.on('connection_invalidated', () => {

            store.commit('SET_FATAL', {
                title: i18n.t('notifications.connection_invalidated.title'),
                message: i18n.t('notifications.connection_invalidated.message')
            })
            this.leave()
        })

        connection.on('disconnect', (reason) => {
            this.wsConnection = null
            console.log(reason)
        })

        connection.on('member_all_idled', () => {
            if (/moderator/.test(store.getters.user.roles.join(':'))) {
                MessageBox.confirm(i18n.t('messages.all_user_idle.message'), {
                    title: i18n.t('messages.all_user_idle.title'),
                    message: i18n.t('messages.all_user_idle.message'),
                    confirmButtonText: i18n.t('confirm'),
                    cancelButtonText: i18n.t('cancel'),
                    type: 'error'
                }).then(() => {
                    this.end()
                }).catch(() => {
                    // nothing
                })
            }
        })

        connection.on('room_ended', async () => {
            MessageBox.alert(i18n.t('messages.room_ended.message'), {
                title: i18n.t('messages.room_ended.title'),
                message: i18n.t('messages.room_ended.message'),
                confirmButtonText: i18n.t('messages.confirm_leave_meeting.leave_now'),
                cancelButtonText: i18n.t('cancel'),
                type: 'warning'
            }).then(async () => {
                await this.leave()
                window.location.href = this.logout_url || '/'
            }).catch(() => {
                // nothing
            })
            setTimeout(async () => {
                await this.leave()
                window.location.href = this.logout_url || '/'
            }, 10000)

        })
    }

    handleRtmChannelEvents(channel) {

        channel.on('ChannelMessage', (message, member_imUid) => {
            const member = this.findMemberBy_imUid(member_imUid)
            if (member) {
                const options = {
                    context: channel,
                    sender: member,
                    message: message
                }
                this.rtmChannelMessages.push(new Message(options))
            }
        })
    }

    sendTextToRtmChannel(text) {
        const me = this.findMember_me()

        const options = {
            context: this.rtmChannel,
            sender: me,
            message: {
                text: text,
                messageType: "TEXT"
            }
        }

        const message = new Message(options)
        message.send().then(() => {
            this.rtmChannelMessages.push(message)
        })
    }

    assignModerator(member_id) {
        this.wsManager.wsRequest('assign_moderator', {
            token: store.getters.user.token,
            member_id: member_id,
            code: store.getters.room.id
        }, false).then(() => {
            // console.log(resp);
        })
    }

    removeModerator(member_id) {
        this.wsManager.wsRequest('remove_moderator', {
            token: store.getters.user.token,
            member_id: member_id,
            code: store.getters.room.id
        }, false).then(() => {
            // console.log(resp);
        })
    }

    assignPresenter(member_id) {
        const presenter = this.findMember_presenter()
        if (presenter) {
            MessageBox.confirm(i18n.t('messages.assign_new_presenter.message'), {
                title: i18n.t('messages.assign_new_presenter.title'),
                message: i18n.t('messages.assign_new_presenter.message'),
                confirmButtonText: i18n.t('confirm'),
                cancelButtonText: i18n.t('cancel'),
                type: 'info'
            }).then(() => {
                this.wsManager.wsRequest('remove_presenter', {
                    token: store.getters.user.token,
                    member_id: presenter.id,
                    code: store.getters.room.id,
                    forced: true
                }, 'presenter_removed').then(() => {
                    // console.log(resp);
                    this.assignPresenter(member_id)
                })
            }).catch(() => {
                // nothing
            })

        } else {
            this.wsManager.wsRequest('assign_presenter', {
                token: store.getters.user.token,
                member_id: member_id,
                code: store.getters.room.id
            }, false).then(() => {
                // console.log(resp);
            })
        }
    }

    addRtcMediaPublisher(tag) {
        return this.wsManager.wsRequest('add_media_publisher', {
            token: store.getters.user.token,
            code: store.getters.room.id,
            tag: tag
        }, 'media_publisher_added')
    }

    informMediaPublished(rtc_uid, type = 'video') {
        return this.wsManager.wsRequest('media_published', {
            token: store.getters.user.token,
            code: store.getters.room.id,
            rtc_uid: rtc_uid,
            type: type
        }, false)
    }

    informMediaUnpublished(rtc_uid, type = 'video') {
        return this.wsManager.wsRequest('media_unpublished', {
            token: store.getters.user.token,
            code: store.getters.room.id,
            rtc_uid: rtc_uid,
            type: type
        }, false)
    }

    muteMember(memberId) {
        if (/moderator/.test(store.getters.user.roles.join(':'))) {
            return this.wsManager.wsRequest('broadcast', {
                token: store.getters.user.token,
                code: store.getters.room.id,
                event: 'mute_member',
                data: {
                    member_id: memberId
                }
            }, 'client_mute_member').then(() => {
                Notification({
                    message: i18n.t('notifications.user_muted.message'),
                    type: 'success'
                })
            })
        }
        return null
    }

    muteAllMembers(mute_presenter = false) {
        if (/moderator/.test(store.getters.user.roles.join(':'))) {
            return this.wsManager.wsRequest('broadcast', {
                token: store.getters.user.token,
                code: store.getters.room.id,
                event: 'mute_all_members',
                data: {
                    originator_member_id: store.getters.user.id,
                    mute_presenter: mute_presenter
                }
            }, 'client_mute_all_members').then(() => {
                Notification({
                    message: i18n.t('notifications.user_muted.message'),
                    type: 'success'
                })
            })
        }
        return null
    }

    setWhiteboardMultiUserWritable(isMultiUserWritable) {
        return this.wsManager.wsRequest('set_whiteboard_settings', {
            token: store.getters.user.token,
            code: store.getters.room.id,
            multi_user_writable: isMultiUserWritable
        }, false)
    }

    toggleMeetingRecording() {
        if (this.recorder) {
            this.endMeetingRecording()
        } else {
            this.startMeetingRecording()
        }
    }

    startMeetingRecording() {
        if (/moderator/.test(store.getters.user.roles.join(':'))) {
            return this.wsManager.wsRequest('record', {
                token: store.getters.user.token,
                code: store.getters.room.id
            }, false)
        }
        return null
    }

    endMeetingRecording() {
        if (!this.recorder) {
            return null
        }
        if (/moderator/.test(store.getters.user.roles.join(':'))) {
            return this.wsManager.wsRequest('stop_recorder', {
                recorder_id: this.recorder.recorder_id,
                token: store.getters.user.token,
                code: store.getters.room.id
            }, false)
        }
        return null
    }

    informUserIdleStatus() {
        return this.wsManager.wsRequest(this.userIdle ? 'member_idled' : 'member_recovered', {
            token: store.getters.user.token,
            code: store.getters.room.id
        }, false)
    }

    end() {
        if (store.getters.user.roles.includes('moderator')) {
            return this.wsManager.wsRequest('end', {
                token: store.getters.user.token,
                code: store.getters.room.id
            }, false)
        }
        return null
    }

    async leave() {
        this.wsManager.disconnect()
        return "done"
    }
}