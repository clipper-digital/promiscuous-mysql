const Connection = require('./connection')
const mysql = require('mysql')

const pools = new Map()

class PoolConnection extends Connection {
  end () {
    // `release()` has no callback, so we can't use `this._call()`.
    // We wrap the release inside a promise because it might throw.
    return Promise.resolve().then(() => this._connection.release())
  }
}

class Pool {
  static create (name, config) {
    const pool = new Pool(config)
    pools.set(name, pool)

    return pool
  }

  static getConnection (name) {
    const pool = pools.get(name)

    if (!pool) {
      return Promise.reject(new Error(`Invalid pool name: ${name}`))
    }

    return pool.getConnection()
  }

  static withConnection (name, callback) {
    return this.getConnection(name)
      .then((connection) => Connection.withConnection(connection, callback))
  }

  static withTransaction (name, callback) {
    return this.getConnection(name)
      .then((connection) => Connection.withTransaction(connection, callback))
  }

  constructor (config) {
    this._pool = mysql.createPool(config)
  }

  getConnection () {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((error, connection) => {
        if (error) {
          return reject(error)
        }

        resolve(new PoolConnection(connection))
      })
    })
  }

  end () {
    return new Promise((resolve, reject) => {
      this._pool.end((error) => {
        if (error) {
          return reject(error)
        }

        resolve()
      })
    })
  }
}

module.exports = Pool
