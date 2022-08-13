chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "check") {
      sendResponse(checkM3u8());
    } else if (request.type === "download") {
      sendResponse(getM3U8(request.url));
    } else if (request.type === "stop") {
      stopFetch = true;
    } else if (request.type === "refresh") {
      window.location.reload();
      sendResponse(true);
    }
  }
);


function checkM3u8() {
  const list = {};
  const videos = document.querySelectorAll("video");
  if (videos.length > 0) {
    videos.forEach(video => {
      if (video.src.indexOf('.m3u8') > -1) {
        list[video.src] = video.src;
      }
    })
  }
  const sources = document.querySelectorAll("source");
  if (videos.length > 0) {
    sources.forEach(source => {
      if (source.src.indexOf('.m3u8') > -1) {
        list[source.src] = source.src;
      }
    })
  }
  return list;
}

let m3u8BasePath = '';
let stopFetch = false;
async function getM3U8(m3u8url) {
  const tsList = [];
  m3u8BasePath = m3u8url.substring(0, m3u8url.lastIndexOf('/') + 1);
  await fetchM3U8File(m3u8url, tsList);
  const tsListArr = await fetchTSList(tsList);
  stopFetch = false;
  const blob = new Blob(tsListArr, { type: 'video/mp2t' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const title = document.title.slice(0, 32).replace(' ', '-');
  a.download = (title) + '.ts';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return url;
}

async function fetchTSList(tsList) {
  const tsListArr = [];
  return new Promise((resolve) => {
    let total = 0;
    for (let i = 0; i < tsList.length; i++) {
      fetchTS(tsList[i]).then(file => {
        if (file) tsListArr.push(file);
      }).finally(() => {
        total++;
        chrome.runtime.sendMessage({
          type: 'progress',
          total: tsList.length,
          current: total
        });
        if (total == tsList.length) {
          resolve(tsListArr)
        }
      });
    }
  })

}

async function fetchM3U8File(url, tsList) {
  const m3u8url = url.indexOf('http') > -1 ? url : (m3u8BasePath + url)
  const res = await fetch(m3u8url);
  const text = await res.text();
  const m3u8arr = text.split('\n');
  await parseTsFile(m3u8arr, tsList, m3u8url);
}

async function parseTsFile(arr, tsList, m3u8url) {
  const nowM3u8BasePath = m3u8url.substring(0, m3u8url.lastIndexOf('/') + 1);
  const m3u8FileList = arr.filter(each => {
    return each.match(/\.m3u8$/);
  })
  if (m3u8FileList.length > 0) {
    for (let i = 0; i < m3u8FileList.length; i++) {
      await fetchM3U8File(m3u8FileList[i] + '?m3u8downloader', tsList);
    }
  }
  arr.forEach(each => {
    if (each.match(/\.ts$/)) {
      each.indexOf('http') > -1 ? tsList.push(each) : tsList.push(nowM3u8BasePath + each);
    }
  })
}

async function fetchTS(url) {
  if (stopFetch) return;
  const res = await fetch(url);
  const blob = await res.blob();
  return blob;
}
