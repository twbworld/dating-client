<template>
  <view class="create-box">
    <navbar />
    <headWarn v-if="headWarn" />
    <chooseDate :btnText="id ? '加入' :'发起'" @lastFunc="chooseDateFunc" />
  </view>
</template>

<script>
import { getDating, join } from '@/common/api/api.js'
import * as db from '@/common/db.js'
export default {
  data() {
    return {
      id: 0,
      headWarn: false,
    }
  },
  onLoad(options) {
    uni.showShareMenu({
      withShareTicket: true, // 展示默认分享按钮
      menus: ['shareAppMessage', 'shareTimeline'], //分享好友 | 分享朋友圈
    })

    if (options.id) {
      this.id = Number(options.id)
    }
  },
  async onShow() {
    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行

    var that = this
    that.$utils.checkLoginPage().then((login) => {
      if (login) {
        that.id > 0 ? that.getDatingInfo() : (that.headWarn = true) //判断"创建"或"加入"
      }
    })
  },
  onShareAppMessage(res) {
    return {
      title: '与我匹配会面时间',
      path: '/',
    }
  },
  methods: {
    chooseDateFunc(dateInfo) {
      var that = this
      that.$utils.checkLoginPage().then((login) => {
        if (!login) {
          // setTimeout(() => {
          //   uni.reLaunch({
          //     url: `/pages/index/index`,
          //   })
          // }, 1000)
          return
        }
        join({ id: this.id * 1, info: dateInfo }).then((res) => {
          if (!res.data || res.data.code !== 0) {
            return
          }
          const datingId = res.data.data?.id || this.id
          uni.reLaunch({
            url: `/pages/detail/detail?id=${datingId}`,
          })

          // this.$utils.showToast("成功" + (that.id ? '加入' :'发起'), 1000)

          // setTimeout(() => {
          //   const datingId = res.data.data?.id || this.id
          //   uni.reLaunch({
          //     url: `/pages/detail/detail?id=${datingId}`,
          //   })
          // }, 1000)
        })
      })
    },
    getDatingInfo() {
      if (this.id < 1) {
        return
      }
      var that = this
      getDating({ id: this.id }).then((res) => {
        if (
          !res.data ||
          res.data.code != 0 ||
          !res.data.data.dating ||
          !res.data.data.users ||
          res.data.data.users.length < 1 ||
          res.data.data.dating.status == undefined
        ) {
          that.$utils.showToast('出错, 请重试 !')
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/index/index',
            })
          }, 1500)
          return
        }
        if (res.data.data.dating.status !== 1) {
          that.$utils.showToast('会面已结束')
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/index/index',
            })
          }, 1500)
          return
        }
        if (this.isUserJoined(res.data.data.users)) {
          uni.redirectTo({
            url: `/pages/detail/detail?id=${this.id}`,
          })
          return
        }
        this.headWarn = true
      })
    },
    isUserJoined(users) {
      return users.some((user) => user.id === db.get('user').id)
    },
  },
}
</script>

<style lang="scss">
page {
  background-color: #fafafa;
  letter-spacing: 3rpx;
}
.create-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
