import * as db from '@/common/db.js'
import { login } from '@/common/api/api.js'

// 通用的 Promise 处理函数
const handlePromise = (fn) => {
  return new Promise((resolve, reject) => {
    fn(resolve, reject);
  });
};

// 显示提示信息
const showToast = (title, duration = 1500, icon = 'none') => {
  uni.showToast({
    title,
    duration,
    icon,
  });
};

// 获取微信登录 code
const getWxCode = () => handlePromise((resolve, reject) => {
  uni.login().then(res => {
    if (!res.code) {
      resolve('');
      return;
    }
    resolve(res.code);
  });
});

// 检查登录状态
const checkLoginPage = (showModal = true) => handlePromise(async (resolve, reject) => {
  let user = db.get('user');
  if (user?.id > 0) {
    resolve(true);
    return;
  }

  await userLogin();
  user = db.get('user');
  if (user?.id > 0) {
    resolve(true);
    return;
  }

  await goRegister(showModal);
  resolve(false);

});

// 用户登录
const userLogin = () => handlePromise(async (resolve, reject) => {
  db.logOut();
  const code = await getWxCode();
  if (!code) {
    showToast('系统错误,请刷新[hoyus]');
    resolve('');
    return;
  }
  try {
    const res = await login({ code });
    const user = res.data?.data?.user;
    if (user?.id > 0) {
      db.set('user', user);
    } else {
      // 新用户, 则下一步为获取用户信息
    }
  } finally {
    resolve('');
  }
});

// 未登录处理
const goRegister = (showModal = true) => handlePromise((resolve, reject) => {
  // showToast('未登录');
  const indexUrl = '/pages/user/register';
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];

  if (indexUrl == '/' + page.route) {
    //注册页不提示跳转
    showModal = false
  }

  if (showModal) {
    uni.showModal({
      title: '登录提示',
      content: '提供昵称/头像, 可体验完整功能 !',
      success: function (res) {
        if (res.confirm) {
          db.set('redirect_url', page.$page.fullPath); // 保存当前地址, 届时登录后重定向
          uni.navigateTo({ url: indexUrl });
        } else if (res.cancel) {
          showToast(`已取消登录`, 1000)
        }
        resolve('');
      }
    });
    return
  }

  resolve('');

});

// 检查重定向
const checkRedirect = () => handlePromise((resolve, reject) => {
  const redirectUrl = db.get('redirect_url');

  if (!redirectUrl) {
    resolve(false);
    return;
  }
  db.del('redirect_url');
  //因另有逻辑实现未登录跳转, 所以这避免未登录跳转, 防止冲突
  if (redirectUrl.trim() && db.get('user')?.id > 0) {
    uni.redirectTo({
      url: redirectUrl.trim(),
    });
    resolve(true);
    return;
  }
  resolve(false);
});

// 返回上一页
const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length === 1) {
    uni.redirectTo({
      url: '/pages/index/index',
    });
  } else {
    uni.navigateBack({
      delta: 1,
    });
  }
};

export default {
  goBack,
  getWxCode,
  checkLoginPage,
  userLogin,
  checkRedirect,
  showToast,
};
