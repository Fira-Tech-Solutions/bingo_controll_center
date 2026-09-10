const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RechargeHistory = sequelize.define('RechargeHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  actual_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  generated_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  bingo_center_username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  debited_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'packages',
      key: 'id',
    },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'recharge_history',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['bingo_center_username'] },
    { fields: ['debited_by'] },
    { fields: ['timestamp'] },
    { fields: ['package_id'] },
  ],
});

module.exports = RechargeHistory;
