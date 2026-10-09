const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AgentCenterAssignment = sequelize.define('AgentCenterAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  agent_username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  center_username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  assigned_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'agent_center_assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['agent_username'] },
    { fields: ['center_username'] },
    { unique: true, fields: ['agent_username', 'center_username'] },
  ],
});

module.exports = AgentCenterAssignment;
