<template>
  <uni-nav-bar :fixed="true" :border="false" background-color="#fff" status-bar>
    <view class="navBarButton">
      <view :style="{position: 'fixed',left: leftSafeArea + 'px'}">
        <uni-icons @click="leftClick" v-show="left" type="left" size="30" :style="{marginRight: leftSafeArea + 'px'}"></uni-icons>
        <uni-icons @click="goHome" v-show="home" type="home" size="30"></uni-icons>
      </view>
      <uni-icons @click="list" v-show="bars" type="bars" size="30" :style="{position: 'fixed',right: rightSafeArea + 'px'}"></uni-icons>
    </view>
  </uni-nav-bar>
</template>

<script>
export default {
  name: 'nav-bar',
  data() {
    return {
      rightSafeArea: 0,
      leftSafeArea: 0,
      home: false,
      bars: false,
      left: false,
    }
  },
  created() {
    const { windowWidth } = uni.getWindowInfo()

    const currentPages = getCurrentPages()
    const route = currentPages[currentPages.length - 1]?.route

    switch (route) {
      case 'pages/index/index':
        this.bars = true
        break
      case 'pages/create/create':
      case 'pages/detail/detail':
      case 'pages/user/user':
      case 'pages/user/feedback':
        this.home = true
        this.left = true
        break
    }

    let rw = windowWidth * 0.05
    let lw = windowWidth * 0.03
    //#ifdef MP-WEIXIN
    rw = windowWidth - uni.getMenuButtonBoundingClientRect().left * 0.95
    //#endif
    this.rightSafeArea = rw
    this.leftSafeArea = lw
  },
  methods: {
    goHome() {
      uni.redirectTo({
        url: '/pages/index/index',
      })
    },
    leftClick() {
      this.$utils.goBack()
    },
    list() {
      uni.navigateTo({
        url: '/pages/user/user',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.navBarButton {
  position: absolute;
  bottom: 8px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-start;
}
</style>
