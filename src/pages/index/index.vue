<template>
  <view class="content">
    <navbar />
    <headWarn v-if="Logined" />
    <image class="logo" :src="fileUrl('static/logo.png')"></image>
    <text class="title">在这匹配最佳会面时间\n即使再忙也要拨冗莅临</text>

    <input v-if="!Logined" type="nickname" class="nicknameInput" placeholder="点击获取昵称" placeholder-class="nicknamePlaceholder" @blur="nickNameInput" @input="nickNameInput" />

    <uni-transition :show="Logined" mode-class="fade" class="startBtn-box"><button @click="start" class="startBtn" type="primary">开始使用</button></uni-transition>
    <uni-transition :show="!Logined && !disableBtn" mode-class="fade" class="startBtn-box"><button open-type="chooseAvatar" @chooseavatar="handleChooseAvatar" class="startBtn startBtnText"
        type="default">授权</button></uni-transition>

  </view>
</template>

<script>
import { userAdd } from '@/common/api/api.js'
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
    this.disableBtn = true

    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行

    const user = db.get('user')
    if (user && user.id) {
      //已登录
      this.Logined = true
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
    // 获取微信昵称
    nickNameInput(e) {
      this.userName = e.detail?.value ? e.detail.value : '微信用户'
      this.disableBtn = false
    },
    async handleChooseAvatar(e) {
      const { avatarUrl } = e.detail
      if (!avatarUrl.trim()) {
        this.$utils.showToast('请重新授权')
        return
      }

      try {
        const code = await this.$utils.getWxCode()
        const res = await userAdd({ code, nick_name: this.userName }, avatarUrl)
        const user = res.data?.data?.user

        if (!user?.id) {
          this.$utils.showToast('错误, 请刷新')
          return
        }

        db.set('user', user)
        const shouldRedirect = await this.$utils.checkRedirect()
        if (!shouldRedirect) {
          this.Logined = true
        }
      } catch (error) {
        this.$utils.showToast('错误, 请重试')
      } finally {
        this.disableBtn = false
      }
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
