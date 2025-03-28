Page({
  data: {
    imageBase64: '',
    debugText: ''
  },

  onLoad() {
    this.isUnloaded = false
    this.loadImageLoop()
  },

  onUnload() {
    this.isUnloaded = true
  },

  // 视频流循环拉取逻辑
  loadImageLoop() {
    if (this.isUnloaded) return

    const startTime = Date.now()
    const timestamp = startTime
    const url = `http://172.20.10.2/capture?time=${timestamp}`

    wx.request({
      url: url,
      method: 'GET',
      responseType: 'arraybuffer',
      success: (res) => {
        const elapsed = Date.now() - startTime
        const base64 = wx.arrayBufferToBase64(res.data)

        this.setData({
          imageBase64: 'data:image/jpeg;base64,' + base64,
          // debugText: `✅ 视频帧耗时: ${elapsed}ms`
        })

        const nextDelay = Math.max(100, 300 - elapsed)
        setTimeout(() => this.loadImageLoop(), nextDelay)
      },
      fail: (err) => {
        console.error("❌ 拉取视频帧失败", err)
        this.setData({
          debugText: "⚠️ 视频帧请求失败"
        })
        setTimeout(() => this.loadImageLoop(), 1000)
      }
    })
  },

  // 点击按钮执行一次高清拍照 + 上传识别
  captureHD() {
    const timestamp = Date.now()
    const url = `http://172.20.10.2/capture_hd?time=${timestamp}`
    const serverURL = 'http://172.20.10.3:5000/upload_photo'

    this.setData({ debugText: "📸 拍照中..." })

    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ debugText: "📤 上传中..." })

          wx.uploadFile({
            url: serverURL,
            filePath: res.tempFilePath,
            name: 'file',
            success: (uploadRes) => {
              try {
                const result = JSON.parse(uploadRes.data)
                console.log("🧠 识别结果：", result)

                if (result.faces_detected > 0) {
                  const names = result.results.map(item => item.name).join(', ')
                  
                  if (names.includes("Unknown")) {
                    this.setData({ debugText: "⚠️ 未识别身份，禁止开门" })
                    wx.showToast({ title: '未知人脸', icon: 'none' })
                  } else {
                    this.setData({ debugText: `✅ 识别到：${names}，已开门` })
                    wx.showToast({ title: `识别到：${names}`, icon: 'success' })
                  }
                } else {
                  this.setData({ debugText: "❌ 未识别，禁止开门" })
                  wx.showToast({ title: '未识别', icon: 'none' })
                }
              } catch (e) {
                console.error("⚠️ JSON解析失败", e)
                this.setData({ debugText: "⚠️ 返回异常" })
                wx.showToast({ title: '识别异常', icon: 'none' })
              }
            },
            fail: (err) => {
              console.error("❌ 上传失败", err)
              this.setData({ debugText: "❌ 上传失败" })
              wx.showToast({ title: '上传失败', icon: 'none' })
            }
          })
        } else {
          this.setData({ debugText: "⚠️ 拍照失败" })
          wx.showToast({ title: '下载失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ debugText: "❌ 请求失败" })
        wx.showToast({ title: '请求失败', icon: 'none' })
      }
    })
  },

  goToAI() {
    wx.navigateTo({
      url: '/pages/ai-assistant/ai-assistant'
    });
  }
})
