import { app } from 'electron'
const electron = require('electron')
const { ipcMain } = require('electron')
const autocannon = require('autocannon')
const db = require('diskdb')
const Menu = electron.Menu || electron.remote.Menu

// now you can use it seamlessly in either main or renderer

console.log(Menu)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

let instance = null

ipcMain.on('run-test', (event, params) => {
  console.log(params) // prints "ping"
  instance = autocannon(params, (err, results) => {
    if (err) {
      console.error(err)
    } else {
      console.log('Autocannon result: ')
      console.log(results)
      event.reply('run-test-reply', results)
    }
  })
})

ipcMain.on('stop-test', async (event, params) => {
  try {
    instance.stop()
    event.reply('stop-test-reply', true)
  } catch (e) {
    console.error(e)
    event.reply('stop-test-reply', false)
  }
})

// Load here all startup windows
require('./mainWindow')
