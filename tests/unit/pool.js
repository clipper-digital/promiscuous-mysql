const config = require('../data/config')
const Connection = require('../../lib/connection')
const Pool = require('../../lib/pool')
const sinon = require('sinon')

exports['static - create'] = {
  valid (test) {
    const pool = Pool.create('create test', config)
    test.ok(pool instanceof Pool, 'should be a Pool instance')
    test.done()
  }
}

exports['static - getConnection'] = {
  'invalid name' (test) {
    Pool.getConnection('missing')
      .catch((error) => {
        test.strictEqual(error.message, 'Invalid pool name: missing', 'should throw error')
        test.done()
      })
  },

  valid (test) {
    const pool = Pool.create('getConnection', config)

    Pool.getConnection('getConnection')
      .then((connection) => {
        test.ok(connection instanceof Connection, 'should provide connection')
        pool.end()
        test.done()
      })
  }
}

exports['static - withConnection'] = {
  valid (test) {
    const providedName = 'test'
    const providedConnection = {}
    const providedCallback = function () {}
    const providedResult = {}

    sinon.stub(Pool, 'getConnection').returns(Promise.resolve(providedConnection))
    sinon.stub(Connection, 'withConnection').returns(Promise.resolve(providedResult))

    Pool.withConnection(providedName, providedCallback)
      .then((result) => {
        test.deepEqual(Pool.getConnection.args[0], [providedName],
          'should pass pool name to Connection.getConnection()')
        test.deepEqual(Connection.withConnection.args[0], [providedConnection, providedCallback],
          'should pass connection and callback to Connection.withConnection()')
        test.strictEqual(result, providedResult, 'should propagate result')

        Pool.getConnection.restore()
        Connection.withConnection.restore()
        test.done()
      })
  }
}

exports['static - withTransaction'] = {
  valid (test) {
    const providedName = 'test'
    const providedConnection = {}
    const providedCallback = function () {}
    const providedResult = {}

    sinon.stub(Pool, 'getConnection').returns(Promise.resolve(providedConnection))
    sinon.stub(Connection, 'withTransaction').returns(Promise.resolve(providedResult))

    Pool.withTransaction(providedName, providedCallback)
      .then((result) => {
        test.deepEqual(Pool.getConnection.args[0], [providedName],
          'should pass pool name to Connection.getConnection()')
        test.deepEqual(Connection.withTransaction.args[0], [providedConnection, providedCallback],
          'should pass connection and callback to Connection.withTransaction()')
        test.strictEqual(result, providedResult, 'should propagate result')

        Pool.getConnection.restore()
        Connection.withTransaction.restore()
        test.done()
      })
  }
}

exports.getConnection = {
  error (test) {
    const providedError = new Error()

    const pool = Pool.create('getConnection', config)
    sinon.stub(pool._pool, 'getConnection').callsArgWith(0, providedError)

    pool.getConnection()
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')
        test.done()
      })
  },

  valid (test) {
    const providedConnection = { query: function () {} }

    const pool = Pool.create('getConnection', config)
    sinon.stub(pool._pool, 'getConnection').callsArgWith(0, null, providedConnection)

    pool.getConnection()
      .then((connection) => {
        test.ok(connection instanceof Connection, 'should provide connection')
        test.strictEqual(connection._connection, providedConnection,
          'should use provided connection')
        test.done()
      })
  }
}

exports.end = {
  error (test) {
    const providedError = new Error()

    const pool = Pool.create('end', config)
    sinon.stub(pool._pool, 'end').callsArgWith(0, providedError)

    pool.end()
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')
        test.done()
      })
  },

  valid (test) {
    const pool = Pool.create('end', config)
    sinon.stub(pool._pool, 'end').callsArgWith(0, null)

    pool.end()
      .then(() => {
        test.ok('should resolve')
        test.strictEqual(pool._pool.end.callCount, 1, 'should call end() on the pool')
        test.done()
      })
  }
}
