/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })
const { session } = require('electron')
const path = require('path')

// Install `vue-devtools`
require('electron').app.on('ready', () => {
  // let installExtension = require('electron-devtools-installer')
  // installExtension.default(installExtension.VUEJS_DEVTOOLS)
  //   .then(() => { })
  //   .catch(err => {
  //     console.log('Unable to install `vue-devtools`: \n', err)
  //   })
  try {
    session.defaultSession.loadExtension(path.resolve(__dirname, '../../vue-devtools'))
  } catch (error) {
    console.log(error, 'vue-devtools')
  }
})

// Require `main` process to boot app
require('./index')