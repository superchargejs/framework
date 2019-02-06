'use strict'

const Env = require('./../env')
const Config = require('./../config')
const Helper = require('./../helper')
const HttpKernel = require('./http/kernel')
const ConsoleKernel = require('./console/kernel')
const Dispatcher = require('../event/dispatcher')
const ExceptionHandler = require('./exceptions/handle-system-exceptions')

class Application {
  constructor () {
    this.craft = null
    this.server = null
    this.appRoot = null
    this.exceptionHandler = new ExceptionHandler()
  }

  /**
   * Returns the HTTP server instance.
   */
  getServer () {
    return this.server
  }

  fromAppRoot (appRoot) {
    this.appRoot = appRoot

    return this
  }

  /**
   * Initialize the hapi server to run
   * your application.
   */
  async httpWithFullSpeed () {
    try {
      this.exceptionHandler.listenForSystemErrors()

      if (!this.appRoot) {
        throw new Error('Cannot start HTTP server without app root directory. Ensure to call .appRoot() inside the server.js file.')
      }

      Helper.setAppRoot(this.appRoot)
      this.loadEnvironmentVariables()
      this.loadApplicationConfig()

      await this.initializeEvents()

      await this.bootstrapHttpServer()
      await this.startServer()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  loadEnvironmentVariables () {
    Env.loadEnvironmentVariables()
  }

  loadApplicationConfig () {
    Config.loadConfigFiles()
  }

  /**
   * Start the hapi server.
   */
  async startServer () {
    try {
      if (!Config.get('app.key')) {
        throw new Error(
          'No application key available. Make sure to define the APP_KEY value in your .env file (or generate one with "node craft key:generate")'
        )
      }

      await this.server.start()
    } catch (err) {
      this.server = null
      console.error(err)
      process.exit(1)
    }
  }

  /**
   * Initialize the hapi server instance and
   * register core plugins, middleware, app
   * plugins and configure views.
   */
  async bootstrapHttpServer () {
    const kernel = new HttpKernel()
    this.server = await kernel.bootstrap()
  }

  /**
   * Register all application events and
   * assign listeners.
   */
  async initializeEvents () {
    await Dispatcher.init()
  }

  async consoleForLife () {
    this.exceptionHandler.listenForSystemErrors()

    if (!this.appRoot) {
      throw new Error('Cannot start Craft console without app root directory. Ensure to call .appRoot() inside the "craft" file.')
    }

    Helper.setAppRoot(this.appRoot)
    this.loadEnvironmentVariables()
    this.loadApplicationConfig()

    await this.bootstrapConsole()
  }

  async bootstrapConsole () {
    const kernel = new ConsoleKernel()
    await kernel.bootstrap()
  }
}

module.exports = Application
