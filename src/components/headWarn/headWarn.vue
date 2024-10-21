<template style="width:100%">
  <uni-transition :mode-class="['fade', 'slide-top']" :show="datingNum > 0">
    <view @click="datingClick" class="dating-box" v-show="datingNum > 0">
      <text>{{ datingNum }}个进行中</text>
      <uni-icons type="right" size="30" style="float: right" color="#F1F1F1"></uni-icons>
    </view>
  </uni-transition>
</template>

<script>
import { getDatingAmount } from '@/common/api/api.js'
import * as db from '@/common/db.js'

export default {
  name: 'headWarn',
  data() {
    return {
      datingIds: [],
    }
  },
  computed: {
    datingNum() {
      return this.datingIds.length
    },
  },
  mounted() {
    const userId = db.get('user')?.id
    if (userId == undefined || userId == null || userId < 1) {
      return
    }
    getDatingAmount().then((res) => {
      const ids = res.data?.data?.ids
      if (Array.isArray(ids)) {
        this.datingIds = ids
      }
    })
  },
  methods: {
    datingClick() {
      const url =
        this.datingNum === 1
          ? `/pages/detail/detail?id=${this.datingIds[0]}`
          : '/pages/user/user'
      uni.navigateTo({ url })
    },
  },
}
</script>

<style lang="scss" scoped>
.dating-box {
  width: 560rpx;
  transition: height 1s;
  max-height: 70rpx;
  line-height: 70rpx;
  margin-top: 20rpx;
  padding: 0 30rpx 0 50rpx;
  border-radius: 35rpx;
  background-color: #1aad19;
  color: #f1f1f1;
}
</style>
