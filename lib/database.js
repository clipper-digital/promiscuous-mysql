const Connection = require('./connection')
const Pool = require('./pool')

exports.Connection = Connection
exports.Pool = Pool

exports.createConnection = (config) => new Connection(config)
exports.withConnection = (config, callback) => Connection.withConnection(config, callback)
exports.withTransaction = (config, callback) => Connection.withTransaction(config, callback)

exports.createPool = (name) => Pool.create(name)
exports.withPooledConnection = (name, callback) => Pool.withConnection(name, callback)
exports.withPooledTransaction = (name, callback) => Pool.withTransaction(name, callback)
