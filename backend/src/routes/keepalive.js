const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'db_unavailable' });
  }
});

module.exports = router;
