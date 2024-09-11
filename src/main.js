import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import utils from "./common/utils";

Vue.prototype.$utils = utils;
Vue.config.productionTip = false

//用于调整执行顺序
Vue.prototype.$onLaunchOk = new Promise(resolve => {
  Vue.prototype.$isResolve = resolve;
})

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()

export default app
