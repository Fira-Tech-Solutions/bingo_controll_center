const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  payment_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  balance_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_bonus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'packages',
  timestamps: true,
  underscored: true,
});

module.exports = Package;
