import * as db from "@/common/db.js";
import ut from "@/common/utils.js";
import ws from '@/common/api/websocket.js'
import app from '@/main'

var reRequest = 1 //重新请求次数

export const request = (options) => {

  return new Promise((resolve, reject) => {
    // uni.showLoading({
    //   title: "加载中...",
    // });
    uni.request({
      url: process.env.VUE_APP_BASE_API + options.url,
      method: options.method || "POST",
      data: options.data || {},
      header: {
        Authorization: db.get("token") || "",
      },
      success: async (res) => {
        if (res.data === undefined || !res.data || res.data.code === undefined || res.data.code == 1 || res.data.code == 2) {
          await showError(res, options);
        }
        handleToken(res.data.token);
        resolve(res);
      },
      fail: (err) => {
        showError(err, options);
        resolve(err);
      },
      complete: () => {
        // uni.hideLoading();
      },
    });
  });
};

//上传文件
export const upload = (options) => {
  return new Promise((resolve, reject) => {
    // uni.showLoading({
    //   title: "加载中...",
    // });
    if (!options.filePath) {
      reject('空文件');
      return
    }

    uni.uploadFile({
      url: process.env.VUE_APP_BASE_API + options.url,
      filePath: options.filePath,
      name: 'file',
      formData: options.data || {},
      header: {
        Authorization: db.get("token") || "",
      },
      success: (res) => {
        res.data = JSON.parse(res.data)
        if (res.data === undefined || !res.data || res.data.code === undefined || res.data.code == 1 || res.data.code == 2) {
          ut.showToast('上传失败', 2000)
        }
        handleToken(res.data.token);
        resolve(res);
      },
      fail: (err) => {
        ut.showToast('上传失败', 2000)
        resolve(err);
      },
      complete: () => {
        // uni.hideLoading();
      },
    });
  });
};

// 处理 token
const handleToken = (token) => {
  if (token != undefined && token != null && token.trim()) {
    db.set("token", token.trim());
  }
};


// 显示错误信息
const showError = async (error, options) => {
  if (!error) {
    return null;
  }

  switch (error.statusCode) {
    case 200:
      switch (error.data.code) {
        case 2: //token过期
          db.logOut()
          await app.$utils.userLogin().then(async () => {
            if (reRequest > 0) {
              //重登
              reRequest -= 1
              await request(options).then((code) => {
                //重新获取数据
                if (code.data) {
                  error.data = code.data
                  reRequest = 1;
                }
              })
            }
          })
          break;
        default:
          ut.showToast(error.data.msg, 2000)
          break;
      }
      break;
    case 403:
      ut.showToast('拒绝访问', 2000)
      break;
    case 500:
      ut.showToast('系统错误, 请重试', 2000)
      break;
    case 404:
      ut.showToast('资源未找到!', 2000)
      break;
    case 504:
      ut.showToast('网络超时', 2000)
      break;
    case 502:
      ut.showToast('错误,请重试', 2000)
      break;
    case 503:
      ut.showToast('错误,请重试', 2000)
      break;
    case 401:
      ut.showToast('未授权，请重新登录', 1500)
      if (db.get("token") == "") {
        setTimeout(() => {
          //去我的页面登录
          uni.navigateTo({
            url: "/pages/index/index",
          });
        }, 1500);
      }
      break;
    default:
      if (error.errMsg.indexOf("request:fail") != -1) {
        ut.showToast("似乎断网了", 1500)
        break
      }
      ut.showToast(error.errMsg, 2000)
      break;
  }
};


export const requestWs = (options) => {
  return new Promise((resolve, reject) => {

    let wsq = new ws(
      process.env.VUE_APP_SOCKET_API + options.url,
      30
    )

    //登录请求
    wsq.getOnOpen(() => {
      wsq.send(db.get("token") || "")
    })

    let isLogin = false

    wsq.getMessage(async (res) => {
      if (isLogin) {
        //当前getMessage只负责登录
        return
      }

      if (res.data == undefined || res.data == null) {
        wsq.close()
        ut.showToast("连接已断开, 请刷新", 1500)
        return
      }

      const msg = JSON.parse(res.data)

      if (msg.code == undefined || (msg.code == 1 &&
        msg.msg != undefined &&
        msg.msg.indexOf('nv2gnb8') > 0)) //排除ws心跳检测的干扰)
      {
        return
      }
      console.log("收到信息:", msg);

      switch (msg.code) {
        case 0:
          isLogin = true
          resolve(wsq)
          break;
        case 2:
          db.logOut()
          app.$utils.userLogin()
          wsq.close()
          ut.showToast("登录已过期, 请刷新", 1500)
          isLogin = false
          resolve(false)
          return

        default:
          resolve(false)
          break;
      }

      handleToken(msg.token);
    })

  });
};
