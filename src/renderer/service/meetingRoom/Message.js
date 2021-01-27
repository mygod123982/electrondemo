export default class Message {

    constructor(options) {
        this.timestamp = options.timestamp || Date.now();
        this.context = options.context || null;
        this.sender = options.sender || null;
        this.message = options.message;
    }

    send() {
        if (this.context.channelId) {
            return this.context.sendMessage(this.message)
        }
    }
}