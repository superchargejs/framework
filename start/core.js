'use strict'

const Config = util('config')
const Laabr = require('laabr')

// configure hapi response logging format
Laabr.format('log', ':time :level :message')

const core = [
  {
    plugin: require('inert')
  },
  {
    plugin: require('vision')
  },
  {
    plugin: require('hapi-dev-errors'),
    options: {
      showErrors: Config.get('app.env') !== 'production'
    }
  },
  {
    plugin: Laabr.plugin,
    options: {
      colored: true,
      hapiPino: {
        logPayload: false
      }
    }
  }
]

module.exports = core
