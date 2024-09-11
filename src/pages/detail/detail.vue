<template>
  <view>
    <navbar />
    <view class="detail-box">
      <uni-card title="推荐会面时间">
        <uni-transition mode-class="fade" :show="cardShow">
          <view class="result-date">{{ date }}</view>
          <view>{{ dateDetail }}</view>
        </uni-transition>
        <view class="gomp" @click="gomp">推荐地点 ></view>
      </uni-card>

      <uni-row>
        <uni-col :span="17">
          <text class="wait-join" v-if="users.length < 2">等待朋友加入...</text>
          <text class="is-join" v-else>{{ users.length - 1 }}位朋友已加入</text>
        </uni-col>
        <uni-col :span="7">
          <button class="share-btn" open-type="share" v-show="dateting.status == 1" type="primary" size="default">邀请 </button>
        </uni-col>
      </uni-row>

      <!-- 人员列表 -->
      <uni-row v-for="item in users" :key="item.ut_id">
        <uni-col :span="4">
          <image :src="fileUrl(item.avatar_url)" mode="aspectFit" class="user-avatar"></image>
        </uni-col>
        <uni-col :span="getSpan(item)">
          <uni-tag class="tag-name" v-for="index in item.info.ts" :key="index" :inverted="true" :text="index.replace(/^0+/, '')" type="primary" />
        </uni-col>
        <!-- 删除按钮(虚拟用户) -->
        <uni-col v-if="showDeleteButton(item)" :span="3">
          <uni-icons @click="del(item)" type="closeempty" size="30" style="float: right"></uni-icons>
        </uni-col>
        <!-- 编辑按钮 -->
        <uni-col v-else-if="showEditButton(item)" :span="3">
          <uni-icons @click="chooseDateOpen(item)" type="compose" size="30" style="float: right"></uni-icons>
        </uni-col>
      </uni-row>

      <view v-if="dateting.status == 1 && user.id == dateting.create_user_id">
        <text @click="chooseDateOpen()" class="add-btn">+ 手动添加会面</text>
      </view>

      <!-- 右下角按钮 -->
      <uni-icons v-show="dateting.status == 1" @click="quitPost" :type="getQuitButtonType()" :color="getQuitButtonColor()" size="65" class="quit-btn"></uni-icons>

      <uni-popup ref="calendar" background-color="#fff" type="bottom" @maskClick="chooseDateClose">
        <chooseDate v-if="chooseDateShow" :btnText="getChooseDateButtonText()" :defaultSelected="updateInfo" @lastFunc="chooseDateFunc" />
      </uni-popup>
    </view>
  </view>
</template>

<script>
import { getDating, quit, join, updateUserTime } from '@/common/api/api.js'
import * as db from '@/common/db.js'

export default {
  data() {
    return {
      dateting: {},
      user: { id: 0 },
      users: [],
      cardShow: false,
      date: '',
      dateDetail: '',
      updateInfo: null, //当前编辑的数据信息
      chooseDateShow: false,
    }
  },
  mounted() {},
  onLoad(options) {
    uni.showShareMenu({
      withShareTicket: true, // 展示默认分享按钮
      menus: ['shareAppMessage', 'shareTimeline'], //分享好友 | 分享朋友圈
    })
    if (options.id) {
      this.dateting.id = Number(options.id)
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getData()
  },
  async onShow() {
    if (!this.dateting.id) {
      uni.redirectTo({
        url: '/pages/user/user',
      })
      return
    }

    await this.$onLaunchOk //等待onLaunchOk信号, 才能往下执行

    var that = this
    that.$utils.checkLoginPage().then((login) => {
      if (login) {
        let user = db.get('user')
        that.user.id = user.id
        that.getData()
        that.cardShow = true
      }
    })
  },
  onShareAppMessage() {
    if (!this.dateting.id) {
      return {
        title: '与我匹配会面时间',
        path: '/',
      }
    }
    return {
      title: '加入队伍, 匹配会面时间',
      path: `/pages/detail/detail?id=${this.dateting.id}`,
    }
  },
  methods: {
    fileUrl(v) {
      return v.trim() ? `${process.env.VUE_APP_BASE_API_FILE}/${v}` : ''
    },
    getData() {
      let that = this
      if (!this.dateting.id) {
        this.$utils.showToast('出错, 请重试 ![hpdoij]')
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/user/user',
          })
        }, 1500)
        return
      }
      getDating({ id: this.dateting.id }).then((res) => {
        if (!res.data?.data) {
          that.$utils.showToast('出错, 请重试 ![pdogop]')
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
            })
          }, 1500)
          return
        }

        const { users, dating } = res.data.data
        if (!users?.length) {
          this.$utils.showToast('出错, 请重试 ![ghopdegk]')
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/user/user',
            })
          }, 1500)
          return
        }
        if (!users.some((user) => user.id === this.user.id)) {
          this.$utils.showToast('您已经退出')
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/user/user',
            })
          }, 1500)
          return
        }
        this.users = users
        this.dateting = dating
        this.updateDateDetails()
        if (this.dateting.status === 0) {
          uni.showModal({
            content: '会面已结束',
            showCancel: false,
          })
        }
      })
    },
    updateDateDetails() {
      const { result } = this.dateting
      if (result?.d?.length) {
        this.date = result.d.join(' | ')
        this.dateDetail = result.r
          ? '玩的开心哟 !'
          : '有小伙伴因没有共同时间而无法匹配时，不妨重新规划'
      } else {
        this.date = '遗憾, 匹配失败'
        this.dateDetail = '并没共同的空闲时间, 建议重新规划哟'
      }
    },
    del(v) {
      let that = this
      uni.showModal({
        content: '确定删除 ?',
        success: function (res) {
          if (res.cancel) {
            return
          }
          quit({ ut_id: v.ut_id * 1 }).then((res) => {
            if (
              res.data == undefined ||
              res.data.code == undefined ||
              res.data.code != 0 ||
              res.data.data.id == undefined ||
              res.data.data.id < 1
            ) {
              that.$utils.showToast('出错, 请重试 ![hpofgkh]')

              return
            }

            that.$utils.showToast('成功')
            that.getData()
          })
        },
      })
    },
    chooseDateOpen(v = null) {
      let that = this
      that.updateInfo = v
      that.chooseDateShow = true //本来想通过在组件设置key属性, 来使组件重新渲染的, 无奈为何不成功; 故使用了v-if
      that.$nextTick(function () {
        that.$refs.calendar.open()
      })
    },
    chooseDateClose() {
      let that = this
      that.updateInfo = null
      that.$refs.calendar.close()
      that.$nextTick(function () {
        setTimeout(() => {
          that.chooseDateShow = false
        }, 300)
      })
    },
    gomp() {
      //跳转"我们哪里见"小程序
      uni.navigateToMiniProgram({
        appId: 'wx1ec936cb4de4c53f',
        path: '/',
        success(res) {},
      })
    },
    quitPost() {
      //结束/退出
      const isCreator = this.dateting.create_user_id === this.user.id
      const content = isCreator
        ? '结束后, 未加入的好友将不能进入, 确定要结束本次会面吗 ?'
        : '退出后后, 将清除您的会面信息, 通过邀请卡片可再次加入'
      const confirmText = isCreator ? '结束会面' : '退出会面'

      let that = this
      uni.showModal({
        title: '提示',
        content,
        confirmText,
        success: (res) => {
          if (res.cancel) {
            return
          }
          quit({ id: that.dateting.id }).then((res) => {
            if (!res.data?.data?.id) {
              that.$utils.showToast('出错, 请重试 ![hgpod]')
              return
            }

            that.$utils.showToast(`成功${confirmText}`, 1000)

            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/user/user',
              })
            }, 1000)
          })
        },
      })
    },
    getSpan(item) {
      return this.showDeleteButton(item) || this.showEditButton(item) ? 17 : 20
    },
    showDeleteButton(item) {
      return (
        this.dateting.status === 1 &&
        item.id === 1 &&
        this.user.id === this.dateting.create_user_id
      )
    },
    showEditButton(item) {
      return this.dateting.status === 1 && item.id === this.user.id
    },
    getQuitButtonType() {
      return this.user.id === this.dateting.create_user_id ? 'close' : 'upload'
    },
    getQuitButtonColor() {
      return this.user.id === this.dateting.create_user_id
        ? '#D84E43'
        : '#FFBE00'
    },
    getChooseDateButtonText() {
      return this.updateInfo ? '修改' : '加入'
    },
    chooseDateFunc(dateInfo) {
      const action = this.updateInfo?.ut_id ? updateUserTime : join
      const params = this.updateInfo?.ut_id
        ? { ut_id: this.updateInfo.ut_id, info: dateInfo }
        : { id: this.dateting.id, info: dateInfo }
      action(params).then((res) => {
        if (!res.data?.data) return
        this.getData()
        this.chooseDateClose()
        this.$utils.showToast(
          this.updateInfo?.ut_id ? '成功修改' : '成功加入',
          1000
        )
      })
    },
  },
}
</script>

<style lang="scss">
page {
  background-color: #fafafa;
  letter-spacing: 3rpx;
}

.detail-box {
  padding: 0 30rpx;
  .uni-card {
    margin-left: 0 !important;
    margin-right: 0 !important;
    text-align: center;
    height: 450rpx;
    .gomp {
      position: absolute;
      bottom: 15rpx;
      right: 15rpx;
      color: #1aad19;
    }
  }
  .result-date {
    font-size: 50rpx;
    color: #1aad19;
    margin-bottom: 30rpx;
    line-height: 60rpx;
  }
  .wait-join {
    font-size: 50rpx;
    color: #ffbe00;
  }
  .is-join {
    font-size: 50rpx;
    color: #000;
  }
  .share-btn {
    color: #1aad19;
    background-color: ghostwhite;
    width: 200rpx;
    float: right;
    font-weight: bold;
  }
  .user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
  }
  .quit-btn {
    position: fixed;
    right: 30rpx;
    bottom: 90rpx;
  }
  .tag-name {
    // margin: 4rpx;
    float: left;
    padding: 6rpx 5rpx;
  }
  .add-btn {
    font-size: 40rpx;
    line-height: 150rpx;
  }
}
.uni-row {
  margin: 20rpx 0;
}
</style>
