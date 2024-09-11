// 通用错误处理函数
const handleError = (fn) => {
  try {
    return fn();
  } catch (e) {
    return false;
  }
};

// 同步存储操作
const syncStorage = {
  get: (key) => uni.getStorageSync(key),
  set: (key, value) => uni.setStorageSync(key, value),
  del: (key) => uni.removeStorageSync(key),
  clear: () => uni.clearStorageSync(),
};

// 异步存储操作
const asyncStorage = {
  get: (key) => {
    let data = "";
    uni.getStorage({
      key,
      success: (res) => {
        data = res.data;
      },
    });
    return data;
  },
  set: (key, value) => {
    uni.setStorage({
      key,
      data: value,
    });
  },
  del: (key) => {
    uni.removeStorage({
      key,
    });
  },
  clear: () => {
    uni.clearStorage();
  },
};

// 取值
const get = (key, sync = true) => handleError(() => (sync ? syncStorage.get(key) : asyncStorage.get(key)));

// 赋值
const set = (key, value, sync = true) => handleError(() => (sync ? syncStorage.set(key, value) : asyncStorage.set(key, value)));

// 移除
const del = (key, sync = true) => handleError(() => (sync ? syncStorage.del(key) : asyncStorage.del(key)));

// 清空
const clear = (sync = true) => handleError(() => (sync ? syncStorage.clear() : asyncStorage.clear()));

// 退出登录，清空用户和 token
const logOut = (sync = true) => handleError(() => {
  del("user", sync);
  del("token", sync);
});

export { get, set, del, clear, logOut };
