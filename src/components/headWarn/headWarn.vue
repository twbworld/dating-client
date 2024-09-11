<template style="width:100%">
  <view class="dating-box">
    <view @click="datingClick" v-show="datingNum > 0" class="dating">你有{{ datingNum }}个进行中的会面
      <uni-icons type="right" size="30" style="float: right" color="#F1F1F1"></uni-icons>
    </view>
  </view>
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
  margin-top: 20rpx;
  height: 70rpx;
  width: 750rpx;
  .dating {
    padding: 0 30rpx 0 50rpx;
    margin: 0 auto;
    width: 75%;
    border-radius: 35rpx;
    background-color: #1aad19;
    line-height: 70rpx;
    color: #f1f1f1;
  }
}
</style>
