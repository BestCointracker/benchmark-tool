import { app } from 'electron'
const electron = require('electron')
const { ipcMain } = require('electron')
const autocannon = require('autocannon')
const Menu = electron.Menu || electron.remote.Menu

// now you can use it seamlessly in either main or renderer

console.log(Menu)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('asynchronous-message', async (event, arg) => {
  console.log(arg) // prints "ping"
  const result = await autocannon({
    url: 'http://localhost:8080/feed/posts',
    connections: 1, // default
    pipelining: 1, // default
    duration: 3 // default
  })
  console.log('Autocannon result: ')
  console.log(result)
  event.reply('asynchronous-reply', 'autocannon OK')
})

// Load here all startup windows
require('./mainWindow')
