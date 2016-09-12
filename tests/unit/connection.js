const config = require('../data/config')
const Connection = require('../../lib/connection')
const helper = require('../helper')
const sinon = require('sinon')

exports['static - withConnection'] = {
  setUp (done) {
    helper.initDatabase.call(this).then(() => done())
  },

  tearDown (done) {
    this.connection.end()
    done()
  },

  'error with connect' (test) {
    const providedError = new Error()
    sinon.stub(Connection.prototype, 'connect').returns(Promise.reject(providedError))

    Connection.withConnection(config, (connection) => {
      test.ok(false, 'should not invoke callback')
    })
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')

        Connection.prototype.connect.restore()
        test.done()
      })
  },

  'error with callback' (test) {
    const providedError = new Error()
    sinon.spy(Connection.prototype, 'end')

    Connection.withConnection(config, (connection) => {
      test.ok(connection instanceof Connection, 'should provide connection')
      test.strictEqual(Connection.prototype.end.callCount, 0,
        'end() should not be called before callback')
      return Promise.reject(providedError)
    })
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')
        test.strictEqual(Connection.prototype.end.callCount, 1,
          'end() should be called after callback')

        Connection.prototype.end.restore()
        test.done()
      })
  },

  'error with end, resolved callback' (test) {
    const providedValue = {}
    const end = Connection.prototype.end
    sinon.stub(Connection.prototype, 'end', function () {
      end.call(this)
      return Promise.reject(new Error())
    })

    Connection.withConnection(config, (connection) => {
      test.ok(connection instanceof Connection, 'should provide connection')
      test.strictEqual(Connection.prototype.end.callCount, 0,
        'end() should not be called before callback')
      return Promise.resolve(providedValue)
    })
      .then((value) => {
        test.strictEqual(value, providedValue, 'should propagate value')
        test.strictEqual(Connection.prototype.end.callCount, 1,
          'end() should be called after callback')

        Connection.prototype.end.restore()
        test.done()
      })
  },

  'error with end, rejected callback' (test) {
    const providedError = new Error()
    const end = Connection.prototype.end
    sinon.stub(Connection.prototype, 'end', function () {
      end.call(this)
      return Promise.reject(new Error())
    })

    Connection.withConnection(config, (connection) => {
      test.ok(connection instanceof Connection, 'should provide connection')
      test.strictEqual(Connection.prototype.end.callCount, 0,
        'end() should not be called before callback')
      return Promise.reject(providedError)
    })
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')
        test.strictEqual(Connection.prototype.end.callCount, 1,
          'end() should be called after callback')

        Connection.prototype.end.restore()
        test.done()
      })
  },

  'resolved, using connection' (test) {
    Connection.withConnection(config, (connection) => {
      return connection.query(
        'INSERT INTO `items` SET `name` = ?',
        ['first item']
      )
        .then((result) => {
          test.strictEqual(result.insertId, 1, 'should insert row')
          test.done()
        })
    })
  }
}

exports['static - withTransaction'] = {
  setUp (done) {
    helper.initDatabase.call(this).then(() => done())
  },

  tearDown (done) {
    this.connection.end()
    done()
  },

  'error with connection' (test) {
    const providedError = new Error()
    sinon.spy(Connection, 'withConnection')
    sinon.stub(Connection.prototype, 'connect').returns(Promise.reject(providedError))

    Connection.withTransaction(config, (connection) => {
      test.ok(false, 'should not invoke callback')
    })
      .catch((error) => {
        test.strictEqual(Connection.withConnection.args[0][0], config,
          'should pass config to Connection.withConnection()')
        test.strictEqual(error, providedError, 'should propagate error')

        Connection.withConnection.restore()
        Connection.prototype.connect.restore()
        test.done()
      })
  },

  'error with transaction' (test) {
    const providedError = new Error()
    const providedCallback = function () {}
    sinon.stub(Connection.prototype, 'transaction').returns(Promise.reject(providedError))

    Connection.withTransaction(config, providedCallback)
      .catch((error) => {
        test.strictEqual(Connection.prototype.transaction.args[0][0], providedCallback,
          'should pass provided callback to transaction')
        test.strictEqual(error, providedError, 'should propagate error')

        Connection.prototype.transaction.restore()
        test.done()
      })
  },

  'resolved, using transaction' (test) {
    Connection.withTransaction(config, (connection) => {
      return connection.query(
        'INSERT INTO `items` SET `name` = ?',
        ['first item']
      )
        .then((result) => {
          test.strictEqual(result.insertId, 1, 'should insert row')
          test.done()
        })
    })
  }
}

exports.transaction = {
  setUp (done) {
    helper.initDatabase.call(this).then(() => done())
  },

  tearDown (done) {
    this.connection.end()
    done()
  },

  'resolved callback' (test) {
    const connection = new Connection(config)
    connection.transaction(() => {
      return connection.query(
        'INSERT INTO `items` SET `name` = ?',
        ['first item']
      )
    })
      .then((result) => {
        test.strictEqual(result.insertId, 1, 'should insert row')

        return connection.query('SELECT * FROM `items`')
      })
      .then((rows) => {
        test.deepEqual(rows, [{ item_id: 1, name: 'first item' }], 'should have one row')
        connection.end()
        test.done()
      })
  },

  'rejected callback' (test) {
    const providedError = new Error()

    const connection = new Connection(config)
    connection.transaction(() => {
      return connection.query(
        'INSERT INTO `items` SET `name` = ?',
        ['first item']
      )
        .then((result) => {
          test.strictEqual(result.insertId, 1, 'should insert row')

          throw providedError
        })
    })
      .catch((error) => {
        test.strictEqual(error, providedError, 'should propagate error')

        return connection.query('SELECT * FROM `items`')
      })
      .then((rows) => {
        test.deepEqual(rows, [], 'should have zero rows')
        connection.end()
        test.done()
      })
  }
}
