class websocketUtil {
  constructor(url, time) {
    this.is_open_socket = false //避免重复连接
    this.url = url //地址
    this.data = null
    //心跳检测
    this.timeout = time * 1000 //多少秒执行检测
    this.heartbeatInterval = null //检测服务器端是否还活着
    this.reconnectTimeOut = null //重连之后多久再次重连

    try {
      this.connectSocketInit()
    } catch (e) {
      console.log('catch');
      this.is_open_socket = false
      this.reconnect();
    }
  }

  // 进入这个页面的时候创建websocket连接【整个页面随时使用】
  connectSocketInit() {
    this.socketTask = uni.connectSocket({
      url: this.url,
      success: () => {
        console.log("正准备建立websocket中...");
        // 返回实例
        return this.socketTask
      },
    });
    this.socketTask.onOpen((res) => {
      console.log("WebSocket连接正常！");
      clearTimeout(this.reconnectTimeOut)
      clearTimeout(this.heartbeatInterval)
      this.is_open_socket = true;
      this.start();
    })
    // 监听连接失败，这里代码我注释掉的原因是因为如果服务器关闭后，和下面的onclose方法一起发起重连操作，这样会导致重复连接
    // uni.onSocketError((res) => {
    // 	console.log('WebSocket连接打开失败，请检查！');
    // 	this.is_open_socket = false;
    // 	this.reconnect();
    // });
    // 这里仅是事件监听【如果socket关闭了会执行】
    this.socketTask.onClose(() => {
      console.log("已经被关闭了")
      this.is_open_socket = false;
      this.reconnect();
    })
    // 监听 WebSocket 错误事件
    this.socketTask.onError((res) => {
      console.log('WebSocket 出错了')
      console.log(res)
    })
  }

  //发送消息
  send(value) {
    return new Promise((resolve, reject) => {
      this.socketTask.send({
        data: value,
        success() {
          console.log("发送信息:", value);
          resolve(true)
        },
        fail(error) {
          console.log('消息发送失败')
          reject(error)
        }
      })
    })
  }

  //开启心跳检测
  start() {
    this.heartbeatInterval = setTimeout(() => {
      this.data = null
      this.send("");
    }, this.timeout)
  }
  //重新连接
  reconnect() {
    //停止发送心跳
    clearInterval(this.heartbeatInterval)
    //如果不是人为关闭的话，进行重连
    if (!this.is_open_socket) {
      this.reconnectTimeOut = setTimeout(() => {
        this.connectSocketInit();
      }, 3000)
    }
  }
  //外部获取消息
  getMessage(callback) {
    this.socketTask.onMessage((res) => {
      return callback(res)
    })
  }

  getOnOpen(callback) {
    this.socketTask.onOpen((res) => {
      return callback(res)
    })
  }

  // 关闭 WebSocket 连接
  close(reason = '关闭') {
    const _this = this
    this.socketTask.close({
      reason,
      success() {
        _this.is_open_socket = false
        _this.data = null
        _this.heartbeatInterval = null
        _this.reconnectTimeOut = null

        clearInterval(_this.heartbeatTimer)
        console.log('关闭 WebSocket 成功')
      },
      fail() {
        console.log('关闭 WebSocket 失败')
      }
    })
  }

}

export default websocketUtil
