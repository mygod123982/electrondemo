import io from 'socket.io-client';

export default class WsManager {

    constructor(options) {
        options = options || {};
        this.url = options.url;
        this.meetingRoom = null;
        this.connection = null;
    }

    setMeetingRoom(meetingRoom) {
        this.meetingRoom = meetingRoom;
    }

    connect() {

        this.connection = io(this.url, {
            transports: ['websocket']
        });
        this.eventHandler();
    }

    disconnect() {
        this.connection.disconnect();
    }

    eventHandler() {
        this.connection.on('connect', () => {
            // console.log("connection success for " + this.url);
        });

        this.connection.on('connect_timeout', (timeout) => {
            console.error("connection timeout for " + this.url, timeout);

        });

        this.connection.on('connect_error', (error) => {
            console.error("connection error for " + this.url, error);

        });

        this.connection.on('error', (error) => {
            console.error("error for " + this.url, error);
        });

        this.connection.on('disconnect', (reason) => {
            console.warn("disconnected for " + this.url, reason)
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                // this.connection.connect();
                console.warn("disconnected by server. not reconnecting");
            }
            // else the socket will automatically try to reconnect
        });

        this.connection.on('reconnect', (attemptNumber) => {
            console.log("reconnected after " + attemptNumber + " attempts for " + this.url)
        });

        this.connection.on('reconnect_attempt', (attemptNumber) => {
            console.log("attemping reconnect number " + attemptNumber + " for " + this.url)
        });

        this.connection.on('reconnect_error', (error) => {
            console.error("reconnect error for " + this.url, error);
        });

        this.connection.on('reconnect_failed', () => {
            console.error("reconnect failed for " + this.url);
        });

        window.addEventListener('offline', () => {
            this.disconnect(); 
        });

        window.addEventListener('online', () => {
            this.connection.connect();
        });

        this.meetingRoom.handleWsConnectionEvents(this.connection);
    }

    wsRequest(request, requestData, expectResponse = true) {
        return new Promise(resolve => {
            this.connection.emit(request, requestData);
            if (expectResponse) {
                if (expectResponse === true) {
                    this.connection.once(request + '_success', (data) => {
                        resolve(data)
                    });
                } else if (typeof expectResponse === "string") {
                    this.connection.once(expectResponse, (data) => {
                        resolve(data)
                    });
                }
            } else {
                resolve("done");
            }
        })
    }
}