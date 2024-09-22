<template>
  <view class="content">
    <navbar />
    <view class="avatar-container">
      <image :src="avatarUrl || defaultAvatar" class="avatar" />
    </view>
    <view class="input-container">
      <input type="nickname" placeholder="请输入昵称" @blur="nickNameInput" @input="nickNameInput" />
    </view>
    <uni-transition :show="true" mode-class="fade" class="button-container">
      <button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" class="choose-avatar-button startBtnText">选择头像</button>
    </uni-transition>
  </view>
</template>

<script>
import { userAdd } from '@/common/api/api.js'
import * as db from '@/common/db.js'
export default {
  data() {
    return {
      nickname: '',
      avatarUrl: '',
      defaultAvatar:
        'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    }
  },
  onLoad(options) {
    uni.showShareMenu({
      withShareTicket: true, // 展示默认分享按钮
      menus: ['shareAppMessage', 'shareTimeline'], //分享好友 | 分享朋友圈
    })
  },
  async onShow() {
    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行

    const user = db.get('user')
    if (user && user.id) {
      this.redirect()
    }
  },
  onShareAppMessage(res) {
    return {
      title: '与我匹配会面时间',
      path: '/',
    }
  },
  methods: {
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      if (!avatarUrl.trim()) {
        this.$utils.showToast('请重新授权')
        return
      }

      this.avatarUrl = avatarUrl
      this.userAdd()
    },
    nickNameInput(e) {
      this.nickname = e.detail?.value ? e.detail.value : '微信用户'
      this.userAdd()
    },
    async userAdd() {
      if (!this.nickname || !this.avatarUrl) {
        return
      }

      try {
        const code = await this.$utils.getWxCode()
        const res = await userAdd(
          { code, nick_name: this.nickname },
          this.avatarUrl
        )
        const user = res.data?.data?.user

        if (!user?.id) {
          this.$utils.showToast(res.data.msg || '错误, 请刷新')
          return
        }
        db.set('user', user)
        this.redirect()
      } catch (error) {
        this.$utils.showToast('错误, 请重试')
      }
    },
    async redirect() {
      const shouldRedirect = await this.$utils.checkRedirect()
      if (!shouldRedirect) {
        uni.navigateTo({
          url: '/pages/index/index',
        })
      }
    },
  },
}
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.avatar-container {
  margin-bottom: 20px;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.input-container,
.button-container,
.result-container {
  margin: 10px 0;
}
.choose-avatar-button {
  width: 200px;
  height: 50px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.startBtn {
  font-size: 50rpx;
  font-weight: bold;
  border-radius: 18rpx;
  width: 400rpx;
}
.startBtnText {
  color: #1aad19;
}
</style>
