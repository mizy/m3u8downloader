chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.type === "check") {
      sendResponse(checkM3u8());
    } else if (request.type === "download") {
      sendResponse(getM3U8(request.url));
    }
  }
);

function checkM3u8() {
  const res = [];
  const videos = document.querySelectorAll("video");
  if (videos.length > 0) {
    videos.forEach(video => {
      if (video.src.indexOf('.m3u8') > -1) {
        res.push(video.src);
      }
    })
  }
  const sources = document.querySelectorAll("source");
  if (videos.length > 0) {
    sources.forEach(source => {
      if (source.src.indexOf('.m3u8') > -1) {
        res.push(source.src);
      }
    })
  }
  return res;
}

function getM3U8(url) {
  fetch(url).then(res => res.text()).then(text => {
    console.log(text)
  })
}

console.log('init m3u8downloader')