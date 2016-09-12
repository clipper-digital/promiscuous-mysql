const config = require('./data/config')
const mysql = require('mysql')

exports.initDatabase = function () {
  this.connection = mysql.createConnection(config)
  return new Promise((resolve, reject) => {
    this.connection.query('TRUNCATE TABLE `items`', (error) => {
      if (error) {
        return reject(error)
      }

      resolve()
    })
  })
}
