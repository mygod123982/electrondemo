import HereWhite from './HereWhite'
// import config from './config'
import uid from '@/utils/uid'

export default class Whiteboard {
    constructor(options) {
        this.element = null
        this.driver = this.createDriver(options)
        this.listeners = {}
        this.phase = null
    }

    async createRoom() {
        return this.driver.createRoom()
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }

        this.listeners[event].push(callback)
    }

    emitEvent(event, params) {
        const listeners = this.listeners[event] || []
        for (const listener of listeners) {
            listener.apply(this, [params])
        }
    }


    join(roomId, token, isWritable = false) {
        const that = this
        this.phase = 'connecting'
        return this.driver.join(roomId, token, isWritable, {
            onRoomStateChanged: function (modifyRoomState) {
                // 只有发生改变的字段，才存在 
                console.log('state_changed', modifyRoomState)
                if (modifyRoomState.broadcastState) {

                    if (that.driver._room.state && that.driver._room.state.sceneState.scenePath && that.driver._room.state.sceneState.scenePath.includes(".")) {
                        that.scalePptToFit()
                    } else {
                        that.resetViewPoint()
                    }

                }
                that.emitEvent('state_changed', modifyRoomState)
            },
            onPhaseChanged: phase => {
                console.log('wb ' + phase)
                // "connecting",
                // "connected",
                // "reconnecting",
                // "disconnecting",
                // "disconnected",
                // console.log(phase);
                this.phase = phase
            }
        })
    }


    updateWritable() {
        this.driver.updateWritable()
    }

    display(element) {
        this.element = document.getElementById(element)
        return this.driver.display(this.element)
    }

    createDriver(options) {
        return new HereWhite(options)
    }

    getRoom() {
        return this.driver.getRoom()
    }

    resize() {
        this.driver.resize()
    }

    addEmptyPage() {
        this.driver.addEmptyPage()
    }

    removePage(page) {
        this.driver.removePage(page)
    }

    clearPages() {
        this.driver.removePage("/")
    }

    switchPage(index) {
        this.driver.switchPage(index)
        this.scalePptToFit()
    }

    scalePptToFit() {
        // console.log(this.driver._room.state)
        if (this.driver._room.state && this.driver._room.state.broadcastState && this.driver._room.state.broadcastState.mode === 'broadcaster')
            try {
                this.driver.scalePptToFit()
            } catch (err) {
                console.log(err)
            }

    }

    resetViewPoint() {
        this.driver.resetViewPoint()
    }

    nextStep() {
        this.driver.nextStep()
        this.scalePptToFit()
    }

    previousStep() {
        this.driver.previousStep()
        this.scalePptToFit()
    }

    nextPage() {
        this.driver.nextPage()
    }

    previousPage() {
        this.driver.previousPage()
    }

    previewPage(page, element, width, height) {
        this.driver.previewPage(page, element, width, height)
    }

    getPages() {
        return this.driver.getPages()
    }

    getCurrentPage() {
        return this.driver.getCurrentPage()
    }

    addPpt(images, path) {
        const lastPage = this.getPages().length
        const scenes = images.map(item => {
            const n = item.src.substring(item.src.lastIndexOf('/') + 1)
            return {
                name: n,
                ppt: {
                    src: item.src,
                    height: item.height,
                    width: item.width,
                }
            }
        })
        this.driver.addPpt('/' + path, scenes)
        this.driver.switchPage(lastPage)
    }

    addDynamicPpt(scenes, uid) {
        const lastPage = this.getPages().length
        const dynamicScenes = scenes.map(item => {
            item.name = uid + item.name
            return item
        })
        this.driver.addPpt('/ppt', dynamicScenes)
        this.driver.switchPage(lastPage)
    }

    addImage(file) {
        const x = this.element.offsetWidth / 2
        const y = this.element.offsetHeight / 2
        const center = this.driver.convertToPointInWorld(x, y)

        this.driver.addImage({
            uuid: uid(),
            url: file.url,
            x: center.x,
            y: center.y,
            height: file.height,
            width: file.width
        })
    }

    async convertDynamicPpt(pptx_url) {
        const pptConverter = this.driver.pptConverter()

        // 请求转码，获得每一个页面的数据
        return pptConverter.convert({
            // 需要进行转换资源的网络地址，请确保可以正常访问
            url: pptx_url,
            // 转换类型
            kind: 'dynamic',
            // 转换进度监听
            onProgressUpdated: progress => {
                console.log(progress)
            },
            checkProgressInterval: 1500,
            checkProgressTimeout: 5 * 60 * 1000,
        })
    }

    insertImagePlaceholder({
        x,
        y,
        width,
        height
    }) {
        const uuid = uid()
        this.driver.insertImagePlaceholder({
            uuid,
            x,
            y,
            width,
            height
        })
        return uuid
    }

    completeImagePlaceholder(uuid, url) {
        this.driver.completeImagePlaceholder(uuid, url)
    }
}