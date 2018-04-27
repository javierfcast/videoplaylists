const { ipcRenderer, shell } = require('electron')

ipcRenderer.on('MediaPlayPause', () => {
  window.dispatchEvent(new Event('MediaPlayPause'));
})

ipcRenderer.on('MediaNextTrack', () => {
  window.dispatchEvent(new Event('MediaNextTrack'));
})

ipcRenderer.on('MediaPreviousTrack', () => {
  window.dispatchEvent(new Event('MediaPreviousTrack'));
})

window.openExternal = function (url) {
  shell.openExternal(url);
}

window.sendSync = function (channel) {
  return ipcRenderer.sendSync(channel, 'electronVersion')
}