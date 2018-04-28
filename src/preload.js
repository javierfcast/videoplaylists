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

window.openUpdateUrl = function () {
  shell.openExternal("https://drive.google.com/uc?export=download&id=1hBdLnzs7yCaOSpEX-FK-p-BlW3KjbfBN");
}

window.sendSync = function (channel, arg) {
  return ipcRenderer.sendSync(channel, arg)
}