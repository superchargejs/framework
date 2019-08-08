'use strict'

const Mongoose = require('mongoose')
const Logger = require('../logging')

/**
 * This Mongoose connector manages the database
 * lifecycle for connecting and closing the
 *  connection.
 */
class MongooseConnector {
  /**
   * Create a MongooseConnector instance. Configure
   * the Mongoose promise library and register
   * a listener for database errors.
   *
   * @param {Object} config
   */
  constructor (config) {
    if (!config) {
      throw new Error('Mongoose connector config missing. Define the mongoose connection settings in your config/database.js file.')
    }

    this.config = config
    this.createConnectionListeners()
  }

  /**
   * Create listeners for connection events.
   */
  createConnectionListeners () {
    Mongoose.connection.on('error', this.onConnectionError)
  }

  /**
   * Handle connection errors.
   *
   * @param {Object} err
   */
  onConnectionError (err) {
    Logger.error(`⚡️ 🚨 Mongoose Error → ${err.message}`)
  }

  /**
   * Create the MongoDB connection.
   */
  async connect () {
    if (this.isNotConnected()) {
      await Mongoose.connect(this.connectionString(), this.config.options)
    }
  }

  /**
   * Compose the database connection string from
   * the database configuration.
   */
  connectionString () {
    const { url, protocol = 'mongodb', host = 'localhost', port = 27017, database } = this.config

    return url || `${protocol}://${host}:${port}/${database}`
  }

  /**
   * Close the MongoDB connection.
   */
  async close () {
    await Mongoose.disconnect()
  }

  /**
   * Returns whether Mongoose has connected to
   * the MongoDB database instance.
   *
   * @returns {Boolean}
   */
  isConnected () {
    return Mongoose.connection.readyState === 1
  }

  /**
   * Determines whether Mongoose is not connected to
   * the MongoDB database instance.
   *
   * @returns {Boolean}
   */
  isNotConnected () {
    return !this.isConnected()
  }
}

module.exports = MongooseConnector
