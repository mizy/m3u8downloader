
$('#check').on('click', function () {
  const val = $('#m3u8-input').val();
  if (val) {
    download(val);
  }
})
$('#refresh').on('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'refresh' }, function (response) {
      console.log(response)
    });
  })
})

var list = {};
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
  }
});
let ffmpeg;
const check = () => {
  if (!ffmpeg) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    ffmpeg = createFFmpeg({
      log: true,
      corePath: '../lib/ffmpeg-core.js',
    });
    ffmpeg.load();
  }
  checkM3u8();
}

const checkM3u8 = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'check' }, function (response) {
      list = response;
      refreshM3u8List(response)
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

const download = async (url) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'download', url }, function (response) {
      console.log(response)
    });
  })
  // hidePlayer();
  // showSpinner();
  // const name = 'video';
  // if (!ffmpeg.isLoaded()) {
  //   await ffmpeg.load();
  // }

  // ffmpeg.FS('writeFile', name, await fetchFile(file));
  // await ffmpeg.run('-i', name, 'output.mp4');
  // const data = ffmpeg.FS('readFile', 'output.mp4');

  // hideSpinner();
  // showPlayer(data);
} 
