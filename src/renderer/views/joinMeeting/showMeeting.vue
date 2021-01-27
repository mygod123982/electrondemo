<template>
  <div class="join-room">
    <div class="joinbox">
      <h4 class="join-title">{{ $t('sysTitle') }}</h4>
      <el-form
        :model="form"
        label-width="120px"
        label-position="left"
        :rules="rules"
        ref="form"
        class="joinform"
      >
        <el-form-item
          v-for="infos in meetingFormText"
          :key="infos.key"
          :label="infos.key"
          :prop="keyOfType[infos.key]"
        >
          <el-input
            v-if="keyOfTypeKeys.indexOf(infos.key) !== -1"
            v-model="form[keyOfType[infos.key]]"
            :show-password="keyOfType[infos.key] === 'password'"
          ></el-input>

          <span v-else>{{ infos.value }}</span>
        </el-form-item>

        <el-form-item v-if="inprocessing" label-width="0">
          <el-button
            type="primary"
            style="width: 100%"
            :loading="btnLoad"
            @click="submitForm('form')"
            >{{ $t('joinRoom.join') }}</el-button
          >
        </el-form-item>
        <el-form-item v-else label-width="0">
          <el-button
            type="primary"
            :loading="btnLoad"
            style="width: 100%"
            @click="back()"
            >{{ $t('confirm') }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import getCodeAndkey from '@/service/getCodeAndkey.js'
export default {
  data() {
    return {
      showForm: false,
      form: { name: '', password: '' },
      btnLoad: false,
      rules: {
        name: [{ required: true, message: '名称不能为空' }],
        password: [{ required: true, message: '会议密码不能为空' }]
      },
      keyOfType: {
        '我的名称': 'name',
        '会议室密码': 'password'
      }
    }
  },
  computed: {
    ...mapGetters('joinmeeting', ['meetingFormText', 'inprocessing', 'requestInfo'])
    ,
    keyOfTypeKeys() {
      return Object.keys(this.keyOfType)
    }
  },
  created() {

  },
  methods: {
    back() {
      this.$router.push({
        path: '/join-meet'
      })
    },

    submitForm() {
      this.btnLoad = true
      this.$refs.form.validate(async bool => {
        if (!bool) return this.btnLoad = false
        const codeAndKey = await getCodeAndkey(this.requestInfo, {
          user_name: this.form.name,
          access_code: this.form.password ? this.form.password : underfind
        }).catch(err => {
          this.$notify({
            type: 'error',
            title: err.code,
            duration: 2000,
            message: err.message
          })
          this.btnLoad = false
        })
        console.log(codeAndKey)
        this.btnLoad = false
        await this.$store.dispatch('joinmeeting/setRoomToMeeting', codeAndKey)
        this.$router.push({
          path: '/test'
        })
      })

    }

  }
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