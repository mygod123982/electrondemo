<template>
  <div class="agroa">
    <router-link to="/">首页</router-link>

    <div id="whiteboard" style="width: 80%; height: 50vh"></div>
  </div>
</template>

<script>

import { WhiteWebSdk } from "white-web-sdk"
import { mapGetters, mapActions } from 'vuex'

export default {

  computed: {
    ...mapGetters('joinmeeting', ['RoomInfo'])
  },
  async mounted() {
    const roomCode = this.RoomInfo.code
    const key = this.RoomInfo.key
    const that = this

    if (roomCode && key) {
      console.log(123)
      that.$store.dispatch('joinRoom', {
        code: roomCode,
        key: key
      }).then((services) => {
        (function (roomUUID, roomToken) {
          console.log('执行里面的')

          var whiteWebSdk = new WhiteWebSdk({
            appIdentifier: '1400/NeEOiACVumwVyw',
          })
          var joinRoomParams = {
            uuid: roomUUID,
            roomToken: roomToken,
          }
          whiteWebSdk.joinRoom(joinRoomParams).then(function (room) {
            // 加入房间成功，获取 room 对象
            // 并将之前的 <div id="whiteboard"/> 占位符变成白板
            room.bindHtmlElement(document.getElementById("whiteboard"))

          }).catch(function (err) {
            // 加入房间失败
            console.error(err)
          })
        })(services.whiteboard.channel_id, services.whiteboard.token)

      }).catch(err => {
        console.log(err)
      })

    }

  }
}
</script>

<style>
</style>