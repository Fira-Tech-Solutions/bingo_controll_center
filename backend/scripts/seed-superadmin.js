require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');
const logger = require('../src/utils/logger');

async function seed() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    // Create SUPER_ADMIN
    const hash = await bcrypt.hash('superadmin123', 10);
    const [superAdmin] = await User.findOrCreate({
      where: { username: 'superadmin' },
      defaults: {
        password: hash,
        full_name: 'Super Administrator',
        email: 'superadmin@bingo.com',
        role: 'SUPER_ADMIN',
        is_banned: false,
      },
    });

    logger.info(`Seeded: ${superAdmin.username} (${superAdmin.role})`);
    logger.info('Seed complete!');
  } catch (err) {
    logger.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
