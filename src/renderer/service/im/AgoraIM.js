import AgoraRTM from 'agora-rtm-sdk'
// import Message from './Message'

// const eventMap = {
//     MessageFromPeer: 'MessageFromPeer'
// }

export default class AgoraIM {

    constructor(config) {
        this.appId = config.appId
        this._client = AgoraRTM.createInstance(this.appId, {
            logFilter: AgoraRTM.LOG_FILTER_WARNING
        })
        this.manager = null
        // this._client.on('ConnectionStateChanged', (newState, reason) => {
        //     console.log('on connection state changed to ' + newState + ' reason: ' + reason);
        // });
        this._channels = new Map()

    }

    setManager(manager) {
        this.manager = manager
        return this
    }


    async login(uid, token, next) {
        // const uid = '' // User ID 为字符串，必须是可见字符（可以带空格）

        try {
            await this._client.login({
                token: token,
                uid: uid
            })
            // console.log('AgoraRTM client login success');
            next()
        } catch (error) {
            console.log('AgoraRTM client login failure', error)
        }
    }

    async logout() {
        await this._client.logout()
        return "done"
    }

    async setLocalUserAttributes(user) {
        return this._client.setLocalUserAttributes(user)
    }

    async deleteChannelAttributesByKeys(channelId, attributeKeys, options) {
        options = options || {}
        options.enableNotificationToChannelMembers = options.enableNotificationToChannelMembers || true
        return this._client.deleteChannelAttributesByKeys(channelId, attributeKeys, options)
    }

    async addOrUpdateChannelAttributes(channelId, attributes, options) {
        options = options || {}
        options.enableNotificationToChannelMembers = options.enableNotificationToChannelMembers || true
        return this._client.addOrUpdateChannelAttributes(channelId, attributes, options)
    }

    async clearChannelAttributes(channelId, options) {
        options = options || {}
        options.enableNotificationToChannelMembers = options.enableNotificationToChannelMembers || true
        return this._client.clearChannelAttributes(channelId, options)
    }

    async getUserAttributes(userId) {
        return this._client.getUserAttributes(userId)
    }

    async getChannelAttributes(channelId) {
        return this._client.getChannelAttributes(channelId)
    }

    async sendMessageToPeer(message, peer) {
        const result = await this._client.sendMessageToPeer(message, peer)

        return result
    }

    async createChannel(channelId) {
        const channel = this._client.createChannel(channelId)

        this._channels.set(channel.channelId, channel)

        return channel
    }

    async sendMessageToChannel(message, channel) {
        await channel.sendMessage(message)
    }

    async sendTextMessageToChannel(message, channel) {
        if (typeof message === "string") {
            const textMessage = { text: message }
            return await channel.sendMessage(textMessage)
        }
    }

    async sendRawMessageToChannel(message, channel) {
        if (typeof message === "string") {
            const textMessage = { text: message }
            await channel.sendMessage(textMessage)
        }
    }
}