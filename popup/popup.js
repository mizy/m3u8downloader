
$('#check').on('click', function () {
  check();
})

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
      refreshM3u8List(response)
    });
  })
}

const refreshM3u8List = (list) => {
  $('#m3u8-list').empty();
  list.forEach(item => {
    $('#m3u8-list').append(`<div class="content-item">
      <div>${item}</div>
      <div><button data-url="${item}">download</button></div>
    </div>`)
  });
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
