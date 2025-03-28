Page({
  data: {
    inputText: "",
    replyText: "",
    loading: false
  },

  onInput(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  async sendMessage() {
    const that = this;
    if (!this.data.inputText.trim()) return;

    that.setData({ loading: true, replyText: "" });

    wx.request({
      url: "http://43.155.36.236:5000/chat",
      method: "POST",
      header: {
        "Content-Type": "application/json"
      },
      data: {
        message: this.data.inputText
      },
      success(res) {
        that.setData({
          replyText: res.data.reply || "无回复",
          loading: false
        });
      },
      fail(err) {
        that.setData({
          replyText: "请求失败，请检查服务器是否开启",
          loading: false
        });
      }
    });
  }
})
