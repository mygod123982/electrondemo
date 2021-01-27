import Vue from "vue";
import * as Sentry from '@sentry/browser';

export default {
    SET_USER(state, user) {
        state.user = user;
        Sentry.configureScope(function(scope) {
            scope.setUser(state.user);
        });
    },
    SET_ROOM(state, room) {
        state.room = room
    },
    USER_JOIN(state) {
        state.userJoined = true;
    },
    USER_LEAVE(state) {
        state.userJoined = false;
        state.room = null
        state.members = []
    },
    ADD_MEMBER(state, member) {
        state.members.push(member);
    },

    SET_USER_ROLES(state, roles) {
        state.user.roles = roles;
        Sentry.configureScope(function(scope) {
            scope.setUser(state.user);
        });
    },

    SET_USER_RTC_PUBLISHERS(state, publishers) {
        state.user.services.rtc = publishers;
        Sentry.configureScope(function(scope) {
            scope.setUser(state.user);
        });
    },

    UPDATE_USER_RTC_PUBLISHER(state, publisher) {
        if (publisher.member_id !== state.user.id) {
            return;
        }
        const index = state.user.services.rtc.findIndex(rtc => rtc.uid === publisher.uid);
        if (index < 0) {
            state.user.services.rtc.push(publisher)
        } else {
            state.user.services.rtc[index] = publisher;
        }
        Sentry.configureScope(function(scope) {
            scope.setUser(state.user);
        });
    },

    MEMBER_SUBSCRIBED_VIDEO(state, data) {
        const index = state.members.findIndex(m => m.id === data.id);
        if (index >= 0) {
            state.members[index] = Object.assign(state.members[index], data)
            state.members[index].hasVideo = true;
        }
    },

    UPDATE_MEMBER_RTCSTREAM(state,stream) {
        const rtcStream_uid = stream.uid;
        const index = state.members.findIndex(m => {
            return m.rtc_uids.includes(rtcStream_uid)
        })
        if (index >= 0) {
            Vue.set(state.members[index].rtc_streams,rtcStream_uid,stream);
        }
    },

    REMOVE_MEMBER_RTCSTREAM(state,rtcStream_uid) {
        const index = state.members.findIndex(m => {
            return m.rtc_uids.includes(rtcStream_uid)
        })
        if (index >= 0) {
            // delete state.members[index].rtc_streams[rtcStream_uid]
            Vue.delete(state.members[index].rtc_streams,rtcStream_uid);
        }
    },

    REMOVE_MEMBER_BY_IM_UID(state, im_uid) {
        const index = state.members.findIndex(m => m.im_uid === im_uid);
        state.members.splice(index, 1)
    },

    UPDATE_ROOM_ROLES(state, roles) {
        state.room.presenter_id = roles.presenter_id;
        state.room.moderator_ids = roles.moderator_ids;
        state.user.isPresenter = state.user.id === state.room.presenter_id ? true : false;
        state.user.isModerator = state.room.moderator_ids.includes(state.user.id) ? true : false;
    },

    UPDATE_ROOM_PRESENTER(state, presenter_id) {
        if (state.room.presenter_id != presenter_id)
            state.room.presenter_id = presenter_id;
        // state.user.isPresenter = state.user.im_uid === state.room.presenter_id ? true : false;
        // state.user.isModerator = state.room.moderator_ids.includes(state.user.im_uid) ? true : false;
    },

    UPDATE_ROOM_MODERATORS(state, moderator_ids) {
        state.room.moderator_ids = moderator_ids;
        // state.user.isPresenter = state.user.im_uid === state.room.presenter_id ? true : false;
        // state.user.isModerator = state.room.moderator_ids.includes(state.user.im_uid) ? true : false;
    },

    ADD_ROOM_MODERATOR(state, moderator_id) {
        state.room.moderator_ids.push(moderator_id);
        state.user.isPresenter = state.user.id === state.room.presenter_id ? true : false;
        state.user.isModerator = state.room.moderator_ids.includes(state.user.id) ? true : false;
    },

    UPDATE_ROOM_WHITEBOARD_SETTINGS(state, whiteboard_settings) {
        Vue.set(state.room.services.whiteboard, 'settings', whiteboard_settings);
    },

    TOGGLE_DEBUG(state) {
        state.debug = !state.debug;
    },

    SET_FATAL(state, fatal) {
        state.fatal = fatal;
    },

    SET_REPLAY_RECORDING(state, recording) {
        state.replayRecording = null;
        setTimeout(() => {
            state.replayRecording = recording;
        }, 100);
        // state.replayRecording = recording;
    }
}