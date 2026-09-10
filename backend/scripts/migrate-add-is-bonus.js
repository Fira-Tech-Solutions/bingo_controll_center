const { sequelize } = require('../src/config/database');

async function migrate() {
  try {
    await sequelize.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_bonus BOOLEAN DEFAULT false;`);
    console.log('✅ Added is_bonus column to packages');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
