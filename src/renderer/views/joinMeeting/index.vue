<template>
  <div class="join-room">
    <div class="joinbox">
      <h4 class="join-title">{{ $t('sysTitle') }}</h4>
      <el-form
        :model="form"
        :rules="rules"
        ref="form"
        style="padding: 40px"
        class="joinform"
      >
        <el-form-item label prop="url">
          <el-input v-model="form.url" placeholder="邀请地址"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            @click="submitForm('form')"
            >{{ $t('joinRoom.join') }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { joinRoom } from "@/api"
import getJoinInfo from '@/service/getJoinInfo'
export default {
  data() {
    return {
      showForm: false,
      form: {
        code: "5ffd72c79d5bc",
        key: "b093va35q28sg84848k8c8gkg"
      },
      rules: {
        url: [
          {
            required: true, message: '地址不能为空', trigger: ['blur', 'change']
          },
          {
            pattern: /^https:\/\/meet.menco.cn\/r\//, message: '请输入正确的会议邀请地址'
          }
        ]
      },

    }
  },

  methods: {

    submitForm(form) {
      this.$refs[form].validate(async valid => {
        if (!valid) return
        const res = await getJoinInfo(this.form.url)
        await this.$store.dispatch('joinmeeting/setMeetingInfo', res)
        this.$router.push({
          path: '/showMeeting'
        })
      })
    },
    async requestJoinRoom(data) {
      return await joinRoom(data)
    }
  },

};
</script>

<style lang="scss" scoped>
.join-room {
  width: 100%;
  height: 100%;
  background-image: linear-gradient(#00796b, #26c6da);
  position: relative;
  .joinbox {
    position: absolute;
    padding-top: 20vh;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    margin: auto;
  }
  .join-title {
    font-size: 50px;
    height: 50px;
    text-align: center;
    color: #fee;
  }
  .joinform {
    border-radius: 0.3em;
    width: 450px;
    padding: 24px;
    margin: auto;
    transform: translateZ(1px);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(13px);
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>