<template>
  <view class="container">
    <navbar />
    <view class="feedback-box">
      <uni-card :is-shadow="true" is-full @click="copyLink" style="text-align: center">
        <text>业余项目, 完全开源\n{{ github }}</text>
      </uni-card>
      <uni-forms ref="form" :rules="rules" :modelValue="feedbackData">
        <uni-forms-item name="desc">
          <uni-easyinput type="textarea" v-model="feedbackData.desc" placeholder="畅所欲言..." />
        </uni-forms-item>
      </uni-forms>

      <uni-file-picker v-model="imageValue" :auto-upload="false" file-mediatype="image" file-extname="png,jpg,jpeg" limit="1" @select="imgSelect"></uni-file-picker>

      <button type="primary" @click="confirm" :disabled="disBtn">反馈</button>
    </view>
  </view>
</template>

<script>
import { feedback } from '@/common/api/api.js'
export default {
  data() {
    return {
      github: 'https://github.com/twbworld/dating',
      disBtn: false,
      feedbackData: {
        desc: '',
        imgs: [],
      },
      // 校验规则
      rules: {
        desc: {
          rules: [
            { required: true, errorMessage: '请简单说两句' },
            { maxLength: 100, errorMessage: '100字内' },
          ],
        },
      },
    }
  },
  onLoad() {
    uni.showShareMenu({
      withShareTicket: true, // 展示默认分享按钮
      menus: ['shareAppMessage', 'shareTimeline'], //分享好友 | 分享朋友圈
    })
  },
  async onShow() {
    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行
    this.$utils.checkLoginPage()
  },
  onShareAppMessage(res) {
    return {
      title: '与我匹配会面时间',
      path: '/',
    }
  },
  methods: {
    copyLink() {
      let that = this
      uni.setClipboardData({
        data: this.github,
        success: () => {
          that.$utils.showToast('已复制链接')
        },
      })
    },
    imgSelect(res) {
      if (!res.tempFilePaths.length) {
        return
      }
      this.feedbackData.imgs = res.tempFilePaths
    },
    confirm() {
      let that = this
      that.$refs.form.validate().then(async (formData) => {
        that.disBtn = true
        const res = await feedback(formData, that.feedbackData.imgs[0]) //暂支持一张图片
        that.disBtn = false
        if (!res.data || res.data.code !== 0) {
          that.$utils.showToast(res.data?.msg || '提交失败')
          return
        }
        that.$utils.showToast('已收到, 感谢您的支持')
        setTimeout(() => {
          that.$utils.goBack()
        }, 1500)
      })
    },
  },
}
</script>

<style lang="scss">
.feedback-box {
  padding: 20rpx;
  background-color: #fff;
}
.uni-forms {
  margin-top: 50rpx;
}

button {
  // font-size: 50rpx;
  margin-top: 50rpx;
  border-radius: 18rpx;
}
</style>
