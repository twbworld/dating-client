class websocketUtil {
  constructor(url, time) {

    this.url = url //地址
    this.timeout = time * 1000 //多少秒执行心跳检测

    this.heartbeatInterval = null //心跳检测
    this.is_open_socket = false //避免重复连接

    try {
      this.connect()
    } catch (e) {
      this.is_open_socket = true
      this.reconnect();
    }
  }

  // 进入这个页面的时候创建websocket连接【整个页面随时使用】
  connect() {

    this.socketTask = uni.connectSocket({
      url: this.url,
      complete: () => { }
    });

    this.socketTask.onOpen((res) => {
      console.log("WebSocket连接正常！");

      clearInterval(this.heartbeatInterval)
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
      console.log("连接断开")
      this.reconnect();
    })

    // 监听 WebSocket 错误事件
    this.socketTask.onError((res) => {
      console.log('WebSocket 出错了:', res)
    })
  }

  //重新连接
  reconnect() {
    //停止发送心跳
    clearInterval(this.heartbeatInterval)
    //如果不是人为关闭的话，进行重连
    if (this.is_open_socket) {
      setTimeout(() => {
        this.connect();
      }, 3000)
    }
  }

  //开启心跳检测
  start() {
    this.heartbeatInterval = setInterval(() => {
      this.send("");
    }, this.timeout)
  }

  // 关闭 WebSocket 连接
  close(reason = '关闭') {
    const that = this
    this.socketTask.close({
      reason,
      success() {
        clearInterval(that.heartbeatInterval)
        that.heartbeatInterval = null
        that.is_open_socket = false
      },
      fail() {
        console.log('关闭 WebSocket 失败')
      }
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

}

export default websocketUtil
