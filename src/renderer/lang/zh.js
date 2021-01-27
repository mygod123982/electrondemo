export default {
    cancel: '取消',
    confirm: '确定',
    close: '关闭',
    success: '成功',
    error: '出错了',
    sysTitle: '方略会议系统',
    browser_potentially_lack_support: '您的浏览器不完全支持所有会议功能。为确保最好的会议体验，请使用最新版本的 Safari、Chrome、火狐 浏览器。',
    devicePicker: {
        hardwareSettings: '硬件设置',
        camera: '摄像头',
        microphone: '麦克风',
        chooseCamera: '摄像头设置',
        chooseMicrophone: '麦克风设置',
        unnamedVideoDevice: '未命名视频设备',
        unnamedAudioDevice: '未命名音频设备',
        videoQuality: '视频质量',
        appleWechatErrorMessage: '很抱歉，苹果微信浏览器不允许我们使用您的摄像头和麦克风。请在Safari浏览器中打开此页面',
        noPermissionsMessage: '请允许我们使用您的摄像头和麦克风',
        videoQualities: {
            p360: '标准',
            p480: '标准2',
            p720: '高清',
            p1080: '全高清'
        }
    },

    joinRoom: {
        join: '加入房间',
        click_to_join_call: '点击加入音视频会议',
        turn_on_devices: '加入后打开我的摄像头和麦克风',
        failed: '无法加入会议，请稍后再试',
        room_ended: '会议已结束'
    },

    side_panel: {
        messages: '互动',
        public_chat: '讨论区',
        public_chat_message_placeholder: '发送公共消息',
        meeting_options: {
            title: '会议选项',
            room_options: {
                title: '会议室目录'
            }
        },
        moderator_tools: {
            title: '主持人工具',
            mute_all: '静音所有人',
            mute_all_except_presenter: '静音非演示者'
        },
        users: '成员',
        me: '（我）',
        make_presenter: '设置为演示者',
        make_moderator: '设置为主持人',
        demote_to_viewer: '降为观众',
        remove_user: '移除此人',
        mute_user: '静音此用户',
        connecting: '正在连接会议...'
    },

    custom_menu: {
        dialog_title: '提示',
        dialog_message: '将在新窗口中打开'
    },

    top_bar: {
        start_recording: '开始录制',
        end_recording: '正在录制',
        fullscreen: '全屏',
        exit_fullscreen: '退出全屏',
        settings: '设置',
        end_meeting: '结束会议',
        logout: '退出会议'
    },

    bottom_bar: {},

    whiteboard: {
        slides: '页面',
        loading: '正在启动白板...',
        failed: '白板启动失败',
        retry: '重试',
        confirm_delete: '确定要删除吗?',
        add_page: '添加页面',
        delete_all: '删除所有',
        upload_doc: {
            success: {
                title: '上传成功',
                message: '您的文件已插入白板'
            },
            failed_try_pdf: {
                title: '转码失败',
                message: '文件转码时出错，请尝试上传PDF文件'
            },
            add_image: {
                title: '插入图片',
                description: '支持常见图片格式'
            },
            add_ppt: {
                title: '添加PPT',
                description: '支持ppt和pdf'
            }
        },
        modes: {
            lecture_mode: {
                title: '讲课模式',
                message: 'All users will be locked to presenter view'
            },
            free_mode: {
                title: '自由模式',
                message: 'All users will be able to interact freely with the whiteboard'
            }
        }
    },

    video_client: {
        video_in_new_window: '正在独立窗口播放',
        toggle_new_window: '切换窗口模式',
        toggle_pip: '切换画中画模式',
        restore: '恢复',
        mute: '静音',
        unmute: '取消静音',
        user_sound_off: '音频已静音',
        user_sound_on: '音频已开通',
        turn_on_video: '启动摄像头',
        turn_off_video: '关闭摄像头',
        turn_on_audio: '启动麦克风',
        turn_off_audio: '关闭麦克风',
        change_camera_settings: '切换摄像头'
    },

    alerts: {
        user_idle: '您现在已进入离机状态。关闭此信息，恢复在线状态。'
    },

    messages: {
        assign_new_presenter: {
            title: '替换演示者',
            message: '替换后当前演示者将失去白板和屏幕分享的权限。是否要继续？'
        },
        all_user_idle: {
            title: '全员挂机状态提示',
            message: '目前会议中所有成员属于挂机状态。是否要结束会议？如果您不操作，此会议将在三分钟后自动结束。'
        },
        room_ended: {
            title: '会议结束通知',
            message: '主持人已结束此会议。您将会被转向会议主页。'
        },
        confirm_end_meeting: {
            title: '结束会议',
            message: '确定要结束会议？所有成员将会被移出会议室。*此会议室将被归档，不能再重启。'
        },
        confirm_leave_meeting: {
            title: '离开会议',
            message: '确定要离开会议室？',
            leave_now: '立马离开'
        },
        confirm_clear_pages: {
            title: '清空',
            message: '确定要删除所有页面? 删除后无法恢复。',
            delete: '删除'
        }
    },

    notifications: {
        agora_compatibility_error: {
            title: '启动会议出错',
            message: '您的浏览器启动音视频会议是出错了。为确保最好的会议体验，请使用最新版本的 Safari、Chrome、火狐 浏览器。'
        },

        member_joined: {
            title: '新成员',
            message: ' 加入了会议'
        },

        member_left: {
            title: '成员退出',
            message: ' 退出了会议'
        },

        moderator_assigned: {
            title: '主持人变动',
            message: ' 成为了主持人'
        },

        moderator_removed: {
            title: '主持人变动',
            message: ' 不再是主持人了'
        },

        presenter_assigned: {
            title: '演示者变动',
            message: ' 成为了演示者'
        },

        self_muted: {
            message: '你已被主持人静音'
        },

        user_muted: {
            message: '用户已静音'
        },

        recorder_started: {
            message: '已开启会议录制'
        },

        recorder_ended: {
            message: '会议录制已结束'
        },

        device_access_denied: {
            title: '没有权限',
            message: '我们无法获取您的多媒体设备'
        },

        screenshare_access_denied: {
            title: '屏幕分享失败',
            message: '我们无法启动屏幕分享'
        },

        screenshare_not_supported: {
            title: '屏幕分享失败',
            message: '您的设备或浏览器不支持屏幕分享'
        },

        connection_invalidated: {
            title: '连接已关闭',
            message: '会议连接关闭了。您是否在其他地方登录了？'
        }

    },
    replayRecording: {
        no_recordings_found: '没有找到可回放的视频'
    }
}