
var list = {};
matchM3u8();
$('#parse').on('click', function () {
  const val = $('#m3u8-input').val();
  if (val) {
    download(val);
  }
})
$('#check').on('click', function () {
  matchM3u8();
})
$('#refresh').on('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'refresh' }, function (response) {
      console.log(response)
    });
  })
})

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  if (details.url.indexOf(".m3u8") > -1 && details.url.indexOf("m3u8downloader") == -1) {
    list[details.url] = details.url;
    refreshM3u8List(list)
  }
  return { extraHeaders: details.requestHeaders };
},
  { urls: ["<all_urls>"] },
  ["extraHeaders"]);


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == 'progress') {
    document.querySelector('#progress').innerHTML = `${request.current}/${request.total}`;
    document.querySelector('#progress').style.width = `${request.current * 100 / request.total}%`
  } else if (request.type == 'ffmpeg') {
    make2mp4(request)
  }
});

function matchM3u8() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'check' }, function (response) {
      response.forEach(each => {
        list[each] = each;
      })
      refreshM3u8List(list)
    });
  })
}

const refreshM3u8List = (list = {}) => {
  const content = Object.keys(list).map(key => `<li class="list-group-item container">
        <div class="row" style="display:flex">
          <div class="col-md-8">${key}</div>
          <div class="col-md-4"><button class="btn btn-sm" data-url="${key}">download</button></div>
        </div>
      </li>`).join('');
  $('#m3u8-list').html(`<ul class="list-group">
    ${content}
    </ul>`);
  addDownloadEvent();
}

const addDownloadEvent = () => {
  $('#m3u8-list button[data-url]').on('click', function () {
    const url = $(this).attr('data-url');
    download(url);
  })
}

async function make2mp4(res) {
  ffmpeg.FS('writeFile', res.title + '.ts', res.blob);
  await ffmpeg.run('-i', res.title + '.ts', res.title + '.mp4');
  const data = await ffmpeg.FS('readFile', res.title + '.mp4');
  const blob = new Blob([data], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = res.title + '.mp4';
  a.click();
  URL.revokeObjectURL(url);
}

const download = async (url) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'download', url }, async function (res) {
    });
  })
}


let ffmpeg;
const init = () => {
  if (!ffmpeg) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    ffmpeg = createFFmpeg({
      log: true,
      corePath: '../lib/ffmpeg-core.js',
    });
    ffmpeg.load();
  }
}
init();