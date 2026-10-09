require('dotenv').config();
const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

async function migrate() {
  console.log('Starting migration: Add AGENT role and agent_center_assignments table');

  // 1. Alter users.role ENUM to include AGENT
  try {
    await sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN role TYPE VARCHAR(20)
    `);
    console.log('✓ users.role column type changed to VARCHAR(20)');
  } catch (err) {
    console.log('⚠ users.role ALTER skipped:', err.message);
  }

  // 2. Create agent_center_assignments table
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS agent_center_assignments (
        id SERIAL PRIMARY KEY,
        agent_username VARCHAR(50) NOT NULL,
        center_username VARCHAR(50) NOT NULL,
        assigned_by VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(agent_username, center_username)
      )
    `);
    console.log('✓ agent_center_assignments table created');
  } catch (err) {
    console.log('⚠ agent_center_assignments CREATE skipped:', err.message);
  }

  // 3. Add indexes
  try {
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_aca_agent ON agent_center_assignments(agent_username)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_aca_center ON agent_center_assignments(center_username)`);
    console.log('✓ Indexes created on agent_center_assignments');
  } catch (err) {
    console.log('⚠ Index creation skipped:', err.message);
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
