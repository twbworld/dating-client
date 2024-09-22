<template style="height: 100%">
  <view>
    <navbar />
    <view class="user-box">
      <view style="margin: 30rpx 0">
        <uni-row>
          <uni-col :span="4">
            <image class="logo-img" mode="aspectFit" :src="fileUrl(user.avatar_url) || defaultAvatar"></image>
          </uni-col>
          <uni-col :span="20">
            <!-- <text v-show="logoutShow" @click="logout" class="topRightText">退登</text> -->
            <text @click="feedback" class="topRightText">反馈</text>
            <button class="share-btn topRightText" :plain="true" open-type="share">推荐给朋友 |</button>
          </uni-col>
        </uni-row>
      </view>
      <text style="font-size: 40rpx">{{ user.nick_name }}</text>

      <view class="tip">你发起的和你参与的会面都在这里</view>

      <uni-swipe-action ref="datingSwipe">
        <uni-transition :mode-class="['fade', 'slide-top']" :show="true">
          <uni-swipe-action-item v-for="value in datings.data" :key="value.ut_id">
            <view class="datingCart" @click="goDetail(value.id)">
              <uni-row>
                <uni-col :span="20">
                  <text class="cardDate">{{ value.date }}</text>
                </uni-col>
                <uni-col :span="4">
                  <text class="cardStatus" :style="{ color: value.status === 1 ? '#1aad19' : '#ffbe00' }">{{ value.status === 1 ? "进行中" : "已结束" }}</text>
                </uni-col>
              </uni-row>
              <view class="time-show">{{ user.id == value.create_user_id ? "我在" : ""
              }}{{ value.time }}发起的会面</view>
              <scroll-view scroll-x="true" class="friends" :scroll-with-animation="true" :scroll-anchoring="true">
                <image v-for="(v, k) in value.avatar_url" :key="k" class="avatar" mode="aspectFit" :src="fileUrl(v)">
                </image>
              </scroll-view>
            </view>
            <template v-slot:right v-if="value.status === 1">
              <button class="slot-button share-btn" :data-id="value.id" :style="{ backgroundColor: '#10AEFF', }" open-type="share" type="primary" size="default">邀请</button>

              <view v-if="user.id == value.create_user_id" @click="quitDating(value)" :style="{backgroundColor: '#F76260'}" class="slot-button">结束</view>
              <view v-else @click="quitDating(value)" :style="{backgroundColor: '#ffbe00'}" class="slot-button">退出</view>
            </template>
          </uni-swipe-action-item>
        </uni-transition>
      </uni-swipe-action>

      <view v-show="loading" class="loading-text">
        {{ noContent ? "到底了 ..." : "加载中 ..." }}
      </view>
    </view>
  </view>
</template>

<script>
import { getDatingList, quit } from '@/common/api/api.js'
import * as db from '@/common/db.js'
export default {
  data() {
    return {
      user: {
        nick_name: '',
        avatar_url: '',
        id: 0,
      },
      datings: {
        data: [], //列表数据
        page: 1,
        lastId: 0,
      },
      noContent: false, //列表数据是否已全部加载
      loading: false,
      logoutShow: false,
      defaultAvatar:
        'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
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

    const login = await this.$utils.checkLoginPage()
    if (login) {
      this.user = db.get('user')
      this.getData(1, 0)
      this.logoutShow = true
    }
  },
  //触底加载
  onReachBottom() {
    this.getData(this.datings.page + 1, this.datings.lastId)
  },
  onShareAppMessage(res) {
    if (res.target?.dataset?.id) {
      return {
        title: '加入队伍, 匹配会面时间',
        path: `/pages/create/create?id=${res.target.dataset.id}`,
      }
    }
    return {
      title: '与我匹配会面时间',
      path: '/',
    }
  },
  methods: {
    fileUrl(v) {
      return v ? `${process.env.VUE_APP_BASE_API_FILE}/${v.trim()}` : ''
    },
    getData(page, lastId) {
      if (page < 1 || lastId < 0 || this.noContent) {
        return false
      }
      if (page == 1) {
        this.datings.data = []
      }

      this.loading = true
      this.noContent = false

      getDatingList({ page, last_id: lastId }).then((res) => {
        if (
          !res.data ||
          res.data.code !== 0 ||
          !res.data.data ||
          !res.data.data.list
        ) {
          return
        }
        const list = res.data.data.list.map((e) => {
          if (lastId === 0 || lastId > e.ut_id) lastId = e.ut_id
          if (e.add_time) {
            const [date, time] = e.add_time.split(' ')
            return { ...e, date, time }
          }
          return e
        })

        this.loading = list.length === 0
        this.noContent = list.length === 0

        this.datings.data.push(...list)
        this.datings.page = page
        this.datings.lastId = lastId
      })
    },
    logout() {
      db.logOut(false)
      this.$utils.showToast('成功退登')
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index',
        })
      }, 1000)
    },
    feedback() {
      uni.navigateTo({
        url: '/pages/user/feedback',
      })
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`,
      })
    },
    quitDating(v) {
      //结束/退出
      const isCreator = v.create_user_id === this.user.id
      const content = isCreator
        ? '结束后, 未加入的好友将不能进入, 确定要结束本次会面吗 ?'
        : '退出后后, 将清除您的会面信息, 通过邀请卡片可再次加入'
      const confirmText = isCreator ? '结束会面' : '退出会面'

      let that = this
      uni.showModal({
        title: '提示',
        content: content,
        confirmText: confirmText,
        success: function (res) {
          if (res.cancel) {
            return
          }
          quit({ id: v.id }).then((res) => {
            if (
              !res.data ||
              res.data.code !== 0 ||
              !res.data.data.id ||
              res.data.data.id < 1
            ) {
              that.$utils.showToast('出错, 请重试 ![drfgihu]')
              return
            }
            that.$utils.showToast(`成功${confirmText}`, 1000)
            that.getData(1, 0)
          })
        },
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
.share-btn {
  border: none !important;
  padding: 0rpx;
}
.share-btn::after {
  border: none !important;
}
.user-box {
  padding: 30rpx;
  .logo-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    float: left;
    background-color: #fff;
  }
  .tip {
    margin: 40rpx 0;
    color: #888;
    font-size: 30rpx;
  }
  .time-show {
    color: #888;
    margin: 20rpx 0 70rpx 0;
  }
  .loading-text {
    text-align: center;
    margin-bottom: 20rpx;
    letter-spacing: 5rpx;
  }
}
.datingCart {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 50rpx 30rpx;
  margin-bottom: 30rpx;
}

.cardDate {
  font-size: 70rpx;
  line-height: 70rpx;
}

.cardStatus {
  float: right;
  font-size: 30rpx;
  line-height: 70rpx;
}

.friends {
  white-space: nowrap;
  width: 100%;
  min-height: 70rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #fff;
  margin-right: 19rpx;
}
.topRightText {
  float: right;
  color: #2782d7 !important;
  margin-right: 15rpx;
  line-height: normal;
  font-size: 18px;
}

.slot-button {
  /* #ifndef APP-NVUE */
  display: inline-flex;
  height: 100%;
  /* #endif */
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  background-color: #ff5a5f;
  color: #ffffff;
  font-size: 14px;
  border-radius: 0;
}
</style>
