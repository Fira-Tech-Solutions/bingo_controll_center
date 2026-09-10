require('dotenv').config();
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

async function migrate() {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database');

    // 1. Create packages table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        payment_amount DECIMAL(15,2) NOT NULL,
        balance_amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(50) NOT NULL,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    logger.info('packages table created/verified');

    // 2. Add package_id column to recharge_history if not exists
    const [cols] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recharge_history' AND column_name = 'package_id';
    `);

    if (cols.length === 0) {
      await sequelize.query(`
        ALTER TABLE recharge_history ADD COLUMN package_id INTEGER REFERENCES packages(id);
      `);
      logger.info('package_id column added to recharge_history');
    } else {
      logger.info('package_id column already exists');
    }

    logger.info('Migration complete');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
