const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const Benchmarks = sequelize.define('data', {
  data_id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  timestamp: {
    type: Sequelize.DECIMAL(),
    allowNull: false
  },
  price: {
    type: Sequelize.DECIMAL(),
    allowNull: false
  },
  coin_name: {
    type: Sequelize.STRING(16),
    allowNull: true
  }
})

module.exports = Benchmarks
