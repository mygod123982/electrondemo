<template>
  <el-container class="app-default">
    <el-header
      @mouseenter.native="showheader = true"
      @mouseleave.native="showheader = false"
      v-show="filter.indexOf($route.name) == -1"
    >
      <el-collapse-transition>
        <el-page-header v-show="showheader" @back="goBack" content="详情页面">
        </el-page-header>
      </el-collapse-transition>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      showheader: false,
      filter: [
        'meet-room'
      ]
    }
  },
  methods: {
    goBack() {
      history.go(-1)
    }
  }
}

</script>
<style lang="scss" scoped>
.app-default {
  width: 100%;
  height: 100%;
  position: relative;
  .el-header {
    position: absolute;
    width: 100%;
    top: 0;
    right: 0;
    z-index: 99;
    padding: 0;
    transform: translateZ(1px);

    .el-page-header {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateZ(1px);
      backdrop-filter: blur(12px);
      line-height: 60px;
      padding-left: 20px;
      padding-right: 20px;
      color: ghostwhite;
    }
  }
  .el-main {
    padding: 0;
    width: 100%;
    height: 100%;
  }
}
</style>