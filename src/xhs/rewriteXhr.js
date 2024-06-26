;(function (xhr) {
  var XHR = xhr.prototype
  var open = XHR.open
  var send = XHR.send

  // 匹配字符串
  var matchesString = '/web/aweme/post/'

  console.log('ok')
  // 对open进行patch 获取url和method
  XHR.open = function (method, url) {
    this._method = method
    this._url = url
    return open.apply(this, arguments)
  }
  // 同send进行patch 获取responseData.
  XHR.send = function (postData) {
    this.addEventListener('load', function () {
      var myUrl = this._url ? this._url.toLowerCase() : this._url
      if (myUrl.includes(matchesString)) {
        if (this.responseType != 'blob' && this.responseText) {
          // responseText is string or null
          try {
            var arr = this.responseText
            console.log(myUrl, arr)
            window.postMessage(
              {
                type: 'inject_message_douyin_aweme',
                url: this._url,
                response: arr,
              },
              '*'
            )
            console.log('注入脚本发送获取list: ', JSON.parse(arr))

            // 因为inject_script不能直接向background传递消息, 所以先传递消息到content_script
            // window.postMessage({ 'url': this._url, "response": arr }, '*');
          } catch (err) {
            console.log(err)
            console.log('Error in responseType try catch')
          }
        }
      }
    })
    return send.apply(this, arguments)
  }
})(XMLHttpRequest)
