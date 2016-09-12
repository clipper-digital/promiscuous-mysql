# Promiscuous MySQL [![Build Status](https://travis-ci.org/clipper-digital/promiscuous-mysql.svg?branch=master)](https://travis-ci.org/clipper-digital/promiscuous-mysql)

Promisucous MySQL is a promise-based MySQL client built on top of the [mysql](https://www.npmjs.com/package/mysql) module.





## Example

```js
const database = require('promiscuous-mysql')

database.withConnection({
  host: 'example.org',
  user: 'bob',
  password: 'secret',
  database: 'my-database'
}, (connection) => {
  return connection.query('SELECT * FROM `items`')
})
  .then((result) => {
    console.log(result)
  })
```




## API - Usage

### `database.createConnection(config) Returns: Connection`

Creates a new `Connection` instance.

* `config` (Object): The connection configuration. See the [`mysql` connection options](https://www.npmjs.com/package/mysql#connection-options) for details.



### `database.withConnection(config, callback) Returns: Promise`

Creates a new `Connection` instance, invokes the callback with the new instance, then ends the connection.

* `config` (Object): The connection configuration. See the [`mysql` connection options](https://www.npmjs.com/package/mysql#connection-options) for details.
* `callback` (Function: `function(connection) Returns: Promise`): A callback used to perform queries with the created connection. Must return a promise indicating whether the operation was successful. The value of the promise returned from the callback will become the return value for `withConnection()`. If there is an error creating the connection, the callback will not be invoked and the returned promise will be rejected.



### `database.withTransaction(config, callback) Returns: Promise`

Creates a new `Connection` instance, starts a transaction, invokes the callback, then ends the transaction and connection.

* `config` (Object): The connection configuration. See the [`mysql` connection options](https://www.npmjs.com/package/mysql#connection-options) for details.
* `callback` (Function: `function(connection) Returns: Promise`): A callback used to perform queries within the created transaction. Must return a promise indicating whether the operation was successful. If the callback's promise is resolved, the transaction will be committed; if the callback's promise is rejected, the transaction will be rolled back. The value of the promise returned from the callback will become the return value for `withTransaction()`. If there is an error creating the connection, the callback will not be invoked and the returned promise will be rejected.



### `database.createPool(name, config) Returns: Pool`

Creates a new connection pool.

* `name` (String): The name for the pool.
* `config` (Object): The connection configuration. See the `mysql` documentation for [connection options](https://www.npmjs.com/package/mysql#connection-options) for details.



### `database.withPooledConnection(name, callback) Returns: Promise`

Creates a new `Connection` instance, invokes the callback with the new instance, then ends the connection.

* `name` (String): The name of the pool to use.
* `callback` (Function: `function(connection) Returns: Promise`): A callback used to perform queries with the created connection. Must return a promise indicating whether the operation was successful. The value of the promise returned from the callback will become the return value for `withPooledConnection()`. If there is an error creating the connection, the callback will not be invoked and the returned promise will be rejected.



### `database.withPooledTransaction(name, callback) Returns: Promise`

Creates a new `Connection` instance, starts a transaction, invokes the callback, then ends the transaction and connection.

* `name` (String): The name for the pool.
* `callback` (Function: `function(connection) Returns: Promise`): A callback used to perform queries within the created transaction. Must return a promise indicating whether the operation was successful. If the callback's promise is resolved, the transaction will be committed; if the callback's promise is rejected, the transaction will be rolled back. The value of the promise returned from the callback will become the return value for `withPooledTransaction()`. If there is an error creating the connection, the callback will not be invoked and the returned promise will be rejected.



### `Connection#query() Returns: Promise`

Performs a query using the existing connection. See the `mysql` documentation for [performing queries](https://www.npmjs.com/package/mysql#performing-queries). All signatures are supported, just leave out the callback.



### `Connection#end() Returns: Promise`

Ends the connection.



### `Pool#end() Returns: Promise`

Ends the connection pool.





## License

Copyright Promiscuous MySQL contributors.
Released under the terms of the ISC license.
