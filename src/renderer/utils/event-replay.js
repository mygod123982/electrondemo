
export default class EventPlayer {
    constructor() {
        
        this.events = [];
        this.firstEvent = null;
        this.lastEvent = null;
        
        this.time = 0;

        this.prePlayedEventIndex = null;
        this.nextEvent = null;

        this.isPlaying = false;
        this.isStopped = false;
        this.isPaused = false;

        this.speed = 1; // 0x 1x 2x 3x 1.5x...

        this.timer = null;
    }

    setEvents(events) {
        this.events = events ?? [];
        this.firstEvent = this.events[0] ?? null;
        this.time = this.firstEvent && this.firstEvent.happened_at
    }


    /**
     * 设置播放速度
     *
     * @param {*} speed 播放倍速。1: 1x 倍速
     * @memberof EventPlayer
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    play(callback, stopped) {
        if (this.isPlaying) {
            return ;
        }

        this.isPlaying = true;

        this.timer = setInterval(() => {
            if (this.isPaused) {
                return;
            }
            
            if ((this.nextEvent.happened_at - this.time ) / this.speed <= 0) {
                const current = this.nextEvent;

                if (this.prePlayedEventIndex + 1 >= this.events.length) {
                    this.isStopped = true;
                    this.isPlaying = false;

                    clearInterval(this.timer)

                    stopped && stopped();

                    return;
                }

                this.nextEvent = this.events[this.prePlayedEventIndex + 1];

                callback && callback(current)
            }

            this.time ++;
        }, 1)
    }






}