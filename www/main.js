const { app, BrowserWindow, ipcMain } = require('electron')
const client = require("./client.js");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let startWin

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 969, height: 545 })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

function createStart () {
  // Create the browser window.
  startWin = new BrowserWindow({ width: 969, height: 545 })

  // and load the index.html of the app.
  startWin.loadFile('index.html')
  // Open the DevTools.
 win.webContents.openDevTools()

  // Emitted when the window is closed.
  startWin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    startWin = null
  })

}

/** This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
*/
app.on('ready', createWindow)

