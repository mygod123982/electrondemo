export default {
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    success: 'Success',
    sysTitle: 'Strategy conference system',
    error: 'Error',
    browser_potentially_lack_support: 'Your browser may not support all features of this meeting system. For the best experience, we recommend you use the lastest version of a Safari, Chrome, or Firefox browser.',
    devicePicker: {
        hardwareSettings: 'Hardware Settings',
        camera: 'Camera',
        microphone: 'Microphone',
        chooseCamera: 'Camera',
        chooseMicrophone: 'Microphone',
        unnamedVideoDevice: 'Unnamed video device',
        unnamedAudioDevice: 'Unnamed audio device',
        videoQuality: 'Video Quality',
        appleWechatErrorMessage: 'The WeChat browser currently does not support camera and microphone access on iOS. Please open this page with Safari if you wish to join the meeting.',
        noPermissionsMessage: 'Please give us access to your camera and microphone.',
        videoQualities: {
            p360: 'Low Detail',
            p480: 'Standard Detail',
            p720: 'High Detail',
            p1080: 'Full Detail'
        }
    },

    joinRoom: {
        join: 'Join Room',
        click_to_join_call: 'Click To Join Call',
        turn_on_devices: 'Turn on my media devices',
        failed: 'Failed to join room, please try again later.',
        room_ended: 'This meeting has already ended.'
    },

    side_panel: {
        messages: 'MESSAGES',
        public_chat: 'Public Chat',
        public_chat_message_placeholder: 'Send to public chat',
        moderator_tools: {
            title: 'Moderator Tools',
            mute_all: 'Mute all',
            mute_all_except_presenter: 'Mute non-presenters'
        },
        meeting_options: {
            title: 'MEETING OPTIONS',
            room_options: {
                title: 'Room Options'
            }
        },
        users: 'USERS',
        me: '(me)',
        make_presenter: 'Make Presenter',
        make_moderator: 'Make Moderator',
        demote_to_viewer: 'Demote to Viewer',
        remove_user: 'Remove User',
        mute_user: 'Mute User',
        connecting: 'Connecting to meeting...'
    },

    custom_menu: {
        dialog_title: '',
        dialog_message: 'A new Window will be opened'
    },

    top_bar: {
        start_recording: 'Record',
        end_recording: 'Recording',
        fullscreen: 'Fullscreen',
        exit_fullscreen: 'Exit fullscreen',
        settings: 'Settings',
        end_meeting: 'End meeting',
        logout: 'Logout'
    },

    bottom_bar: {},

    whiteboard: {
        slides: 'Slides',
        loading: 'Loading Whiteboard...',
        failed: 'Failed to load whiteboard',
        retry: 'Retry',
        confirm_delete: 'Delete this page?',
        add_page: 'New Page',
        delete_all: 'Clear All',
        upload_doc: {
            success: {
                title: 'Presentation Added',
                message: 'Your presentation was added successfully.'
            },
            failed_try_pdf: {
                title: 'Conversion Error',
                message: 'We were unable to convert your document. Please try uploading a PDF file instead'
            },
            add_image: {
                title: 'Add Image',
                description: '.jpeg, .png'
            },
            add_ppt: {
                title: 'Add Presentation',
                description: '.ppt/x, .pdf'
            }
        },
        modes: {
            lecture_mode: {
                title: 'Lecture Mode',
                message: 'All users will be locked to presenter view'
            },
            free_mode: {
                title: 'Free Mode',
                message: 'All users will be able to interact freely with the whiteboard'
            }
        }
    },

    video_client: {
        video_in_new_window: 'Opened in new window',
        toggle_new_window: 'Toggle Windowed Mode',
        toggle_pip: 'Toggle Picture in Picture',
        restore: 'Restore',
        mute: 'Mute',
        unmute: 'Unmute',
        user_sound_off: 'User Sound Off',
        user_sound_on: 'User Sound On',
        turn_on_video: 'Turn On Camera',
        turn_off_video: 'Turn Off Camera',
        turn_on_audio: 'Turn On Microphone',
        turn_off_audio: 'Turn Off Microphone',
        change_camera_settings: 'Change Camera Settings'
    },

    alerts: {
        user_idle: 'You are now marked as idle. Close this message to return to online status.'
    },

    messages: {
        assign_new_presenter: {
            title: 'Replace Presenter',
            message: 'The current presenter will lose whiteboard and screenshare privileges. Continue?'
        },
        all_user_idle: {
            title: 'Inactivity Warning',
            message: 'We have detected that all meeting members are idle. Would you like to end the meeting? This meeting will end in 3 minutes if you do not take action.'
        },
        room_ended: {
            title: 'Meeting Ended Warning',
            message: 'A moderator has ended this meeting. You will be redirected soon.'
        },
        confirm_end_meeting: {
            title: 'End Meeting',
            message: 'Are you sure you wish to end this meeting? All meeting members will be removed from the room. This meeting room will be archived and you will not be able to start it again.'
        },
        confirm_leave_meeting: {
            title: 'Leave Meeting',
            message: 'Are you sure you wish to leave this meeting room?',
            leave_now: 'Leave now'
        },
        confirm_clear_pages: {
            title: 'Remove All Pages',
            message: 'Are you sure you wish to remove all pages? This cannot be undone.',
            delete: 'Remove'
        },
    },

    notifications: {
        agora_compatibility_error: {
            title: 'Failed to start WebRTC',
            message: 'Your browser encountered some errors while joining the meeting. For the best experience, we recommend you use the lastest version of a Safari, Chrome, or Firefox browser.'
        },

        member_joined: {
            title: 'New Member',
            message: ' joined the meeting'
        },

        member_left: {
            title: 'Member Left',
            message: ' left the meeting'
        },

        moderator_assigned: {
            title: 'Moderator Changed',
            message: ' became a moderator'
        },

        moderator_removed: {
            title: 'Moderator Changed',
            message: ' is no longer a moderator'
        },

        presenter_assigned: {
            title: 'Presenter Changed',
            message: ' is now the presenter'
        },

        self_muted: {
            message: 'You were muted'
        },

        user_muted: {
            message: 'User muted'
        },

        recorder_started: {
            message: 'Meeting is now being recorded'
        },

        recorder_ended: {
            message: 'Meeting is no longer recorded'
        },

        device_access_denied: {
            title: 'Permission Denied',
            message: 'We were unable to access your media devices'
        },

        screenshare_access_denied: {
            title: 'Permission Denied',
            message: 'We were unable to start screen capture'
        },

        screenshare_not_supported: {
            title: 'Not Supported',
            message: 'Your device or browser does not support screen sharing'
        },

        connection_invalidated: {
            title: 'Connection Closed',
            message: 'Your connection to the room was terminated. Did you login somewhere else?'
        }

    },
    replayRecording: {
        no_recordings_found: 'No Recordings Found.'
    }
}