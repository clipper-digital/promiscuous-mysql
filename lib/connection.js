const mysql = require('mysql')

class Connection {
  static withConnection (config, callback) {
    // `Pool.withConnection()` will pass a `PoolConnection` instance
    const connection = config instanceof Connection ? config : new Connection(config)

    let result
    let error
    return connection.connect()
      // Let the user perform whatever actions they need with the connection
      .then(() => callback(connection))

      // Cache the result so we can reference it after closing the connection
      .then((_result) => {
        result = _result
      })
      .catch((_error) => {
        error = _error
      })

      // Close the connection
      .then(() => connection.end())
      // Ignore errors closing the connection
      .catch(() => null)

      // Restore the original result from the callback's promise
      .then(() => {
        if (error) {
          throw error
        }

        return result
      })
  }

  static withTransaction (config, callback) {
    return this.withConnection(config, (connection) => {
      return connection.transaction(callback)
    })
  }

  constructor (config) {
    // `config` may be an existing `mysql` Connection instance
    this._connection = config.query ? config : mysql.createConnection(config)
  }

  connect () {
    // If the connection has already been established, don't do anything
    if (this._connection.threadId) {
      return Promise.resolve()
    }

    return this._call('connect')
  }

  end () {
    return this._call('end')
  }

  query () {
    return this._call('query', ...arguments)
  }

  transaction (callback) {
    let result
    let error

    // Begin the transaction
    return this.query('START TRANSACTION')

      // Perform the user's actions within the transaction
      .then(() => callback(this))

      // Cache the result so we can reference it after ending the transaction
      .then((_result) => {
        result = _result
      })
      .catch((_error) => {
        error = _error
      })

      .then(() => {
        // If the callback throws an error, rollback the transaction
        if (error) {
          // Ignore errors in rolling back. Probably a network or similar failure
          // which will result in the changes not being applied anyway.
          return this.query('ROLLBACK').catch(() => null)

        // If the callback is successful, commit the transaction
        } else {
          return this.query('COMMIT')
        }
      })

      // Return the result/error from the callback after we've finished our transaction
      .then(() => {
        if (error) {
          throw error
        } else {
          return result
        }
      })
  }

  _call (method, ...args) {
    return new Promise((resolve, reject) => {
      this._connection[method](...args, (error, result) => {
        if (error) {
          return reject(error)
        }

        resolve(result)
      })
    })
  }
}

module.exports = Connection
