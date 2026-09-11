require('pg');
const app = require('../src/index');
const { connectDatabase } = require('../src/config/database');

let dbConnected = false;

module.exports = async (req, res) => {
  if (!dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
    } catch (err) {
      console.error('Initial DB connection error in serverless entry:', err);
    }
  }
  return app(req, res);
};
