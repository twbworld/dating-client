<script>
import * as db from '@/common/db.js'
export default {
  onLaunch: function () {
    this.checkUpdateVersion()
    this.initializeConfig()
  },
  onShow: function () {
    this.handleAppShow()
  },
  onHide: function () {
    // console.log('App Hide')
  },
  methods: {
    initializeConfig() {
      if (!db.get('config', false)) {
        // config: {appId, icon, nickname}
        db.set('config', __wxConfig.accountInfo, false)
      }
    },
    handleAppShow() {
        this.$utils.checkRedirect() // 判断跳转
        this.$isResolve() // 标记执行完毕

      // console.log('App Show')
    },
    checkUpdateVersion() {
      const updateManager = uni.getUpdateManager()

      updateManager.onCheckForUpdate((res) => {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate)
      })

      updateManager.onUpdateReady((res) => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已经准备好，确认重启应用',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          },
        })
      })

      updateManager.onUpdateFailed((res) => {
        uni.showModal({
          title: '已经有新版本了哟~',
          content: '请手动删除当前小程序，重新搜索打开',
          showCancel: false,
        })
      })
    },
  },
}
</script>

<style>
/*每个页面公共css */
</style>
