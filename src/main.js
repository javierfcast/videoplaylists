const electron = require('electron')

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const Menu = electron.Menu
const ipcMain = electron.ipcMain
const session = electron.session

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let willQuitApp = false

function createWindow () {
  // Create the browser window.
  // const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../public/apple-icon-64x64.png'),
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadURL('http://localhost:3000');
  mainWindow.loadURL('https://videoplaylists.tv');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closing.
  mainWindow.on('close', function (event) {
    if (process.platform === 'darwin' && !willQuitApp) {
      event.preventDefault();
      mainWindow.hide();
    }
    else {
      window = null
    }
  })
}

// 'before-quit' is emitted when Electron receives 
// the signal to exit and wants to start closing windows
app.on('before-quit', () => willQuitApp = true);

ipcMain.on('electronVersion', (event, arg) => {
  event.returnValue = app.getVersion()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  //Create window
  createWindow()

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('MediaPlayPause');
  })

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('MediaNextTrack');
  })

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('MediaPreviousTrack');
  })

  var template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        // {role: 'toggledevtools'},
        {label: "Clear Cache", click: function() {mainWindow.webContents.reloadIgnoringCache()}},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
  ];
  
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        // {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })
  }
  
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
  else {
    mainWindow.show()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
