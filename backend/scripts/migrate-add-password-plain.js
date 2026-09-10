const { sequelize } = require('../src/config/database');

async function migrate() {
  try {
    await sequelize.query(`ALTER TABLE bingo_centers ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255);`);
    console.log('✅ Added password_plain column to bingo_centers');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
