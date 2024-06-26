function download(url) {
  var options = {
    url: url,
  }
  chrome.downloads.download(options)
}

//通过消息机制获取页面上的image元素
async function onMenuClick() {
  //获取当前打开的tab
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  //发送消息，告诉页面，我们需要获取图片元素
  var response = await chrome.tabs.sendMessage(tab.id, { type: 'images' })
  var data = response || []
  //加在默认数据
  chrome.storage.local.get(['filterUrl']).then((result) => {
    var value = result['filterUrl']
    console.log(value)
    if (value) {
      //循环下载
      data.filter((src) => src.indexOf(value) != -1).map(download)
    } else {
      data.map(download)
    }
  })
}

/**
 * 添加右键菜单
 */
chrome.contextMenus.create({
  type: 'normal',
  title: '批量导出',
  contexts: ['all'],
  id: 'menu-1',
})

/**
 * 右键菜单点击事件
 */
chrome.contextMenus.onClicked.addListener(function (data) {
  if (data.menuItemId == 'menu-1') {
    onMenuClick(data)
  }
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type == 'down') {
    download(message.data)
  } else if (message.type == 'badge') {
    chrome.action.setBadgeBackgroundColor({ color: '#f00' })
    chrome.action.setBadgeText({
      text: message.data,
    })
  }
})
