
// Live-reload client

(function() {

let ws

function connectSocket() {

  ws = new WebSocket('ws://'+(location.host || 'localhost').split(':')[0] + ':35729')

  ws.onmessage = (e) => {

    let data = JSON.parse(e.data)

    if (data.reload) location.reload()
    else if (data.reloadCSS) refreshCSS()
  }
}

function refreshCSS() {

  const sheets = document.getElementsByTagName("link")

  for (let i = 0; i < sheets.length; i++) {
    let elem = sheets[i]
    const rel = elem.rel
    const reloadThis = elem.href
      && elem.href.substring(0, 5) !== 'data:'
      && (
        typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet"
      )
    if (!reloadThis) continue
    const url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, "")
    console.log('[Reload CSS]', url)
    elem.href = url + ( url.indexOf("?") >= 0 ? "&" : "?" )
      + "_cacheOverride=" + (new Date().valueOf())
  }
}

const max = 3
let attempts = 0
let timer = setInterval(trySocket, 3000)

function trySocket() {
  if (ws && ws.readyState === 1) return
  attempts++
  if (attempts>=max) return clearInterval(timer)
  connectSocket()
}

trySocket()

})()
