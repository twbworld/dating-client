<template>
  <view class="chooseDate-box">
    <view class="chooseDate-select">选择您的空闲日期</view>
    <uni-calendar style="margin-top: 10rpx" :start-date="computedCalendarDate(-183)" :end-date="computedCalendarDate(183)" :selected="calendarSelected" @change="chooseDate" />

    <picker class="chooseDate-picker" mode="multiSelector" :range="picker.range" :value="picker.index" @change="chooseTime">
      <uni-transition mode-class="fade" :show="chooseYMD != ''">
        <text class="picker-text">(可选) 指定时间段</text>
      </uni-transition>
    </picker>

    <button class="requestBtn" type="primary" :disabled="disableRequestBtn" @click="confirm">
      {{ btnText }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'chooseDate',
  props: {
    btnText: {
      type: String,
      default: '加入',
    },
    defaultSelected: {
      type: Object, //默认选中的日期
      default: null,
    },
  },
  data() {
    return {
      disableRequestBtn: true,
      CPSelected: {}, //记录每个日期(calendar)对应的时间段(picker)(为了操作体验, 包含已取消选择的日期的时间)
      chooseYMD: '', //当前选中的日期
      calendarSelected: [], //已选日期列表
      picker: {
        range: [
          [
            '8:00',
            '9:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
          ],
          ['至'],
          [
            '9:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00',
          ],
        ],
        index: [0, 0, 14], //每一列默认选中的值下标
      },
    }
  },
  created() {
    this.initializeDefaultSelected()
    this.disableRequestBtn = 0 === this.calendarSelected.length
  },
  methods: {
    computedCalendarDate(day = 0) {
      const myDate = new Date()
      myDate.setDate(myDate.getDate() + day)
      return `${myDate.getFullYear()}-${
        myDate.getMonth() + 1
      }-${myDate.getDate()}`
    },
    initializeDefaultSelected() {
      if (this.defaultSelected?.info?.length > 0) {
        this.defaultSelected.info.forEach((timeRange) => {
          const [date1, date2] = timeRange.t.map((time) => time.split(' '))
          if (!date1[0] || !date2[0]) return

          const index = this.getIndexByHour(date1[1], date2[1])
          if (index === false) return

          const info = this.getTimeByIndex(index)
          if (info === false) return

          this.calendarSelected.push({ date: date1[0], info })
          this.CPSelected[date1[0]] = index
        })
      }
    },
    chooseDate(e) {
      const existingIndex = this.calendarSelected.findIndex(
        (item) => item.date === e.fulldate
      )
      if (existingIndex !== -1) {
        //日期被二次选择, 表示取消
        this.calendarSelected.splice(existingIndex, 1) //从列表剔除
        this.chooseYMD = ''
        this.disableRequestBtn = this.calendarSelected.length === 0
        return
      }

      const index = this.CPSelected[e.fulldate] || [
        0,
        0,
        this.picker.range[2].length - 1,
      ]
      const info = this.CPSelected[e.fulldate]
        ? this.getTimeByIndex(this.CPSelected[e.fulldate])
        : '全天' //曾选择过; 为了用户体验, 用回选择过时间

      this.picker.index = this.CPSelected[e.fulldate] = index
      //加入已选日期列表
      this.calendarSelected.push({
        date: e.fulldate,
        info,
        data: [], //可在这放信息
      })
      this.chooseYMD = e.fulldate
      this.disableRequestBtn = this.calendarSelected.length === 0
    },
    chooseTime(e) {
      if (e.detail.value.length !== 3 || !this.chooseYMD) {
        this.$utils.showToast('出错, 请重试 ![gofpisdj]')
        return
      }
      const selectedDate = this.calendarSelected.find(
        (item) => item.date === this.chooseYMD
      )
      if (selectedDate) {
        const info = this.getTimeByIndex(e.detail.value)
        selectedDate.info = info === false ? '全天' : info
        this.CPSelected[this.chooseYMD] = e.detail.value //保留操作数据
      }
    },
    confirm() {
      this.disableRequestBtn = true
      const info = { t: [] }

      for (const n of this.calendarSelected) {
        const index = this.CPSelected[n.date]
        if (
          !index ||
          index.length !== 3 ||
          this.picker.range.length !== 3 ||
          !this.picker.range[0][index[0]] ||
          !this.picker.range[2][index[2]]
        ) {
          this.$utils.showToast('出错, 请重试 ![doi[j]]')
          this.disableRequestBtn = false
          return
        }
        info.t.push([
          `${n.date} ${this.picker.range[0][index[0]]}:00`,
          `${n.date} ${this.picker.range[2][index[2]]}:00`,
        ])
      }

      if (info.t.length < 1) {
        this.$utils.showToast('请选择空闲日期')
        return
      }

      this.disableRequestBtn = false
      this.$emit('lastFunc', info)
    },
    getTimeByIndex(e) {
      if (
        e.length !== 3 ||
        e[0] < 0 ||
        e[2] < 0 ||
        e[0] > this.picker.range[0].length ||
        e[2] > this.picker.range[2].length
      ) {
        return false
      }

      let info = '全天'
      if (0 !== e[0] || e[2] + 1 !== this.picker.range[2].length) {
        info =
          this.picker.range[0][e[0]].split(':')[0] +
          '-' +
          this.picker.range[2][e[2]].split(':')[0] +
          '时'
      }
      return info
    },
    getIndexByHour(start, end) {
      //匹配出在picker.range中的对应索引值
      const [sHour, sMinute] = start.replace(/^0+/, '').split(':')
      const [eHour, eMinute] = end.replace(/^0+/, '').split(':')

      if (!sHour || !sMinute || !eHour || !eMinute) {
        return false
      }

      const t1 = `${sHour}:${sMinute}`
      const t2 = `${eHour}:${eMinute}`

      const index1 = this.picker.range[0].findIndex((time) => time === t1)
      const index2 = this.picker.range[2].findIndex((time) => time === t2)

      // 如果找不到匹配的索引，返回默认索引
      return [
        index1 !== -1 ? index1 : this.picker.index[0],
        this.picker.index[1],
        index2 !== -1 ? index2 : this.picker.index[2],
      ]
    },
  },
}
</script>

<style lang="scss" scoped>
.uni-calendar__content {
  background-color: #fafafa !important;
}

.requestBtn {
  font-size: 50rpx;
  font-weight: bold;
  border-radius: 18rpx;
  width: 400rpx;
  position: fixed;
  bottom: 170rpx;
  background-color: #179b16;
  border-color: #179b16;
}
.chooseDate-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 300rpx;
  .chooseDate-select {
    color: #1aad19;
    text-align: center;
    margin: 20rpx 0;
  }
  .chooseDate-picker {
    margin-top: 40rpx;
    min-height: 100rpx;
    display: flex;
    justify-content: center;
    .picker-text {
      border: 5rpx solid #1aad19;
      border-radius: 15rpx;
      color: #1aad19;
      padding: 10rpx 15rpx;
      font-weight: bold;
    }
  }
}
</style>
