<template>
  <view class="content">
    <navbar />
    <headWarn v-if="Logined" />
    <image class="logo" :src="fileUrl('static/logo.png')"></image>
    <text class="title">来匹配共同时间\n再忙也得聚聚哇</text>

    <uni-transition :show="true" mode-class="fade" class="startBtn-box">
      <button @click="start" class="startBtn" type="primary">开始</button>
    </uni-transition>

  </view>
</template>

<script>
import * as db from '@/common/db.js'
export default {
  data() {
    return {
      Logined: false,
      disableBtn: true,
      userName: '',
    }
  },
  onLoad(options) {
    uni.showShareMenu({
      withShareTicket: true, // 展示默认分享按钮
      menus: ['shareAppMessage', 'shareTimeline'], //分享好友 | 分享朋友圈
    })
  },
  async onShow() {
    //如果从其他页面返回, 则重置
    this.Logined = false

    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行

    var that = this
    const user = db.get('user')
    if (user && user.id) {
      //已登录
      this.Logined = true
    } else {
      that.$utils.checkLoginPage(false).then((login) => {
        if (login) {
          this.Logined = true
        }
      })
    }
  },
  onShareAppMessage(res) {
    return {
      title: '与我匹配会面时间',
      path: '/',
    }
  },
  methods: {
    fileUrl(v) {
      return v.trim() ? `${process.env.VUE_APP_BASE_API_FILE}/${v}` : ''
    },
    start() {
      uni.redirectTo({
        url: '/pages/create/create',
      })
    },
  },
}
</script>

<style lang="scss">
page {
  letter-spacing: 3rpx;
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 100rpx auto;
}

.title {
  text-align: center;
  font-size: 40rpx;
  color: #000;
}
.startBtn-box {
  position: fixed;
  bottom: 170rpx;
  .startBtn {
    font-size: 50rpx;
    font-weight: bold;
    border-radius: 18rpx;
    width: 400rpx;
  }
  .startBtnText {
    color: #1aad19;
  }
}
.nicknameInput {
  text-align: center;
  position: fixed;
  bottom: 100rpx;
}
.nicknamePlaceholder {
  color: #1aad19;
}
</style>
