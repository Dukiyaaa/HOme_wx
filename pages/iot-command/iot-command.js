Page({
  data: {
    percent: '',
    loading: false,
    responseText: ''
  },

  onInput(e) {
    this.setData({
      percent: e.detail.value
    });
  },

  sendCommand() {
    const that = this;
    const percent = Number(this.data.percent);

    if (isNaN(percent) || percent < 0 || percent > 100) {
      wx.showToast({
        title: '请输入0-100之间的数字',
        icon: 'none'
      });
      return;
    }

    that.setData({ loading: true });

    // ✅ 指向你的后端公网地址
    wx.request({
      url: 'http://43.155.36.236:5005/sendCommand', 
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        percent: percent
      },
      success(res) {
        that.setData({
          responseText: JSON.stringify(res.data, null, 2),
          loading: false
        });
      },
      fail(err) {
        that.setData({
          responseText: "❌ 请求失败：" + JSON.stringify(err),
          loading: false
        });
      }
    });
  }
});
