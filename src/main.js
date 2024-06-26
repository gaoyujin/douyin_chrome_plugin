/**
 * 显示网络图片的内存大小
 * @param {*} src
 * @returns
 */
function getByte(src) {
  let newUrl = src.replace(/^http:\/\//i, 'https://')
  console.log(newUrl)

  return fetch(newUrl)
    .then(function (res) {
      return res.blob()
    })
    .then(function (data) {
      return (data.size / 1024).toFixed(2) + 'kB'
    })
}

/**
 * 基于dom的title属性来设置显示图片信息
 * @param {*} el
 * @param {number} byte zijie
 */
function showInfo(el, byte) {
  var html = `真实尺寸:${el.naturalWidth}*${el.naturalHeight}\n显示尺寸:${el.width}*${el.height}\n存储大小:${byte}`
  el.title = html
}

function download(url) {
  var options = {
    url: url,
  }
  chrome.downloads.download(options)
}

// 创建遮挡层div
function createOverlay() {
  const overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.top = 0
  overlay.style.left = 0
  overlay.style.right = 0
  overlay.style.bottom = 0
  overlay.style.background = 'rgba(0, 0, 0, 0.5)' // 半透明遮挡层的颜色
  overlay.style.zIndex = 10000
  overlay.style.display = 'flex'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.className = 'overlay'

  const subHtml = document.createElement('div')
  subHtml.style.color = '#c45656'
  subHtml.style.fontSize = '20px'
  subHtml.style.fontWeight = 'bold'
  subHtml.innerText = '正在解析，请稍等.....'

  overlay.appendChild(subHtml)

  return overlay
}

// 添加遮挡层到body
function addOverlay() {
  const overlay = createOverlay()
  document.body.appendChild(overlay)
}
// 移除遮挡层
function removeOverlay() {
  console.log('移除遮挡层')
  const overlay = document.body.querySelector('.overlay')
  if (overlay) {
    document.body.removeChild(overlay)
  }
}

/**
 * 在document上代理mouseover事件
 */
document.addEventListener(
  'mouseover',
  function (e) {
    //移动到图片元素上时、则显示信息
    if (e.target.tagName == 'IMG') {
      getByte(e.target.src).then((byte) => {
        showInfo(e.target, byte)
      })
    }
  },
  true
)

/**
 * 在document上代理dragend事件
 */
document.addEventListener('dragend', async function (e) {
  if (e.target.tagName == 'IMG') {
    await chrome.runtime.sendMessage({ type: 'down', data: e.target.src })
  }
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'images') {
    var imgs = document.querySelectorAll('img')
    var srcs = Array.from(imgs).map((img) => img.src)
    sendResponse(srcs)
  }
})

// window.addEventListener('load', async function (e) {
//   var imgs = document.querySelectorAll('img')
//   await chrome.runtime.sendMessage({ type: 'badge', data: imgs.length + '' })
// })

// 绑定这个事件需要在 manifest 中设定 "run_at": "document_start"
document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false)

function fireContentLoadedEvent() {
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL('src/xhs/rewriteXhr.js')

  const head = document.head
  console.log(head.firstChild)

  if (head.firstChild) {
    head.insertBefore(s, head.firstChild)
  } else {
    head.appendChild(s)
  }

  // PUT YOUR CODE HERE.
  //addOverlay()
}

window.addEventListener('message', function (event) {
  if (
    event.data &&
    event.data.type &&
    event.data.type === 'inject_message_douyin_aweme'
  ) {
    console.log('CCCCCCCCCCCCCCCCCCCCCCC', event.data.response)
    setTimeout(() => {
      removeOverlay()

      // 检查是否可以关闭窗口
      if (window.close) {
        // 尝试关闭当前窗口
        window.close()
      } else {
        // 如果不能关闭，可以引导用户手动关闭窗口
        alert('无法自动关闭窗口，请手动关闭标签。')
      }
    }, 700)
  }
})
