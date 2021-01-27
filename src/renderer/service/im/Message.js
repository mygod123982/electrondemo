export default class Message {
    constructor(text, type = 'text') {
        this.type = type;
        this.text = text;
    }
}