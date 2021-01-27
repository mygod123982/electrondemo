// import "white-web-sdk/style/index.css";
import { WhiteWebSdk, createPlugins } from 'white-web-sdk'
import store from '@/store'
// import {videoPlugin} from "@netless/white-video-plugin";

export default class HereWhite {

    constructor(options) {
        // const plugins = createPlugins({"video": videoPlugin, });
        const plugins = createPlugins({})
        plugins.setPluginContext("video", { identity: "host" })
        options.plugins = plugins
        options.loggerOptions = {
            // Whether to disable upload, default upload
            reportDebugLogMode: 'banReport',
            // Upload log level, default info
            reportLevelMask: "error",
            // Print log level, default info
            printLevelMask: "error"
        }
        this._client = new WhiteWebSdk(options)
        this._room = null
    }

    async join(roomId, token, isWritable, callback) {
        console.log(roomId, token, 'roomId, token')
        console.log(this._client, 'this._client')
        try {

            this._client.joinRoom({
                uuid: roomId,
                roomToken: token,
                isWritable: isWritable
            }, callback).then(room => {
                console.log(room)
                this._room = room
                this.roomId = roomId
                this.roomToken = token
                console.log(this._room, ' this._room')

            }).catch(err => {
                return Promise.reject(err)
            })
            // this._room = await this._client.joinRoom({
            //     uuid: roomId,
            //     roomToken: token,
            //     isWritable: isWritable
            // }, callback).catch(err => {
            //     return Promise.reject(err)
            // })


        } catch (error) {
            console.log('加入失败', error)
        }

    }

    display(element) {
        console.log(element, ' element')

        this._room.bindHtmlElement(element)
    }

    async leave() {
        await this._room.disconnect()
        this._room = null
    }

    resize() {
        this._room.refreshViewSize()
    }

    scalePptToFit() {
        this._room.scalePptToFit("immediately")
    }

    resetViewPoint() {
        this._room.moveCamera({
            centerX: 0,
            centerY: 0,
            scale: 1,
            animationMode: "immediately"
        })
    }

    async setBroadcaster() {
        if (this._room) {
            this._room.setWritable(true).then(() => {
                this._room.disableCameraTransform = false
                this._room.disableDeviceInputs = false
                this._room.setViewMode("broadcaster")
            })
        }
    }

    async disableWritable() {
        if (this._room) {
            this._room.setWritable(false).then(() => {
                this._room.disableCameraTransform = true
                this._room.disableDeviceInputs = true
            })
        }
    }

    async updateWritable() {
        if (store.getters.whiteboard_settings && store.getters.whiteboard_settings.multi_user_writable) {
            await this._room.setWritable(true)
            this._room.disableCameraTransform = false
            this._room.disableDeviceInputs = false
            this._room.setViewMode("freedom")
        } else if (/presenter/.test(store.getters.user.roles.join(''))) {
            this.setBroadcaster()
        } else {
            this.disableWritable()
        }
    }

    async replay(element) {
        this._player = await this._client.replayRoom({
            uuid: this.roomId,
            roomToken: this.roomToken
        })
        this._player.bindHtmlElement(document.getElementById(element))
        this._player.play()
    }

    stop() {
        this._player.stop()
    }

    getRoom() {
        return this._room
    }

    getPages() {
        return this._room.state.sceneState.scenes
    }

    getCurrentPage() {
        return this._room.state.sceneState.index
    }

    addEmptyPage() {
        this.addPage('/', [{}])
    }

    addPpt(path, scenes) {
        // 只能使用 ‘/’根目录，其他目录会导致 不成功，但无报错
        this._room.putScenes('/', scenes)
    }

    addPage(path, definition) {
        this._room.putScenes(path, definition)
    }

    removePage(dirOrPath) {
        this._room.removeScenes(dirOrPath)
    }

    switchPage(index) {
        const count = this._room.state.sceneState.scenes.length
        if (count <= index || index < 0) {
            return
        }
        this._room.setSceneIndex(index)
    }

    nextStep() {
        this._room.pptNextStep()
    }

    previousStep() {
        this._room.pptPreviousStep()
    }

    nextPage() {
        this.switchPage(this._room.state.sceneState.index + 1)
    }

    previousPage() {
        this.switchPage(this._room.state.sceneState.index - 1)
    }

    previewPage(page, element, width, height) {
        this._room.scenePreview(page, element, width, height)
    }


    addImage({ uuid, url, x, y, width, height }) {

        this._room.insertImage({
            uuid: uuid,
            centerX: x,
            centerY: y,
            width: width,
            height: height,
            locked: false, // 新增 locked 字段
        })

        this._room.completeImageUpload(uuid, url)
    }

    insertImagePlaceholder({ uuid, x, y, width, height }) {
        this._room.insertImage({
            uuid: uuid,
            centerX: x,
            centerY: y,
            width: width,
            height: height,
            locked: false, // 新增 locked 字段
        })
    }

    completeImagePlaceholder(uuid, url) {
        this._room.completeImageUpload(uuid, url)
    }


    addVideo(url, { height, width, x, y }) {
        height = height || 270
        width = width || 480
        x = x || 0
        y = y || 0
        this._room.insertPlugin("video", {
            originX: x,
            originY: y,
            width: width,
            height: height,
            attributes: {
                pluginVideoUrl: url
            },
        })
    }

    convertToPointInWorld(x, y) {
        return this._room.convertToPointInWorld({ x, y })
    }

    pptConverter() {
        return this._client.pptConverter(this.roomToken)
    }

}