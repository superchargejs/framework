'use strict'

const Path = require('path')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')
const ReadRecursive = require('recursive-readdir')

class LoadRoutes {
  constructor () {
    this._routesFolder = 'app/http/routes'
  }

  async extends (server) {
    if (this.hasRoutes()) {
      return this.loadRoutes(server)
    }

    console.log(`No routes detected in ${this._routesFolder}`)
  }

  async hasRoutes () {
    return await this.routeFolderExists() && this.hasRouteFiles()
  }

  async routeFolderExists () {
    return Fs.exists(this.routesFolder())
  }

  async hasRouteFiles () {
    return Object.keys(await this.loadRouteFiles()).length > 0
  }

  async loadRoutes (server) {
    const files = await this.loadRouteFiles()

    files.forEach(routeFile => {
      server.route(this.resolve(routeFile))
    })
  }

  routesFolder () {
    return Path.resolve(Helper.appRoot(), this._routesFolder)
  }

  async loadRouteFiles () {
    return ReadRecursive(this.routesFolder())
  }

  resolve (file) {
    return require(Path.resolve(this.routesFolder(), file))
  }
}

module.exports = LoadRoutes
