const app = require('../src/index');
const { connectDatabase } = require('../src/config/database');

let dbConnected = false;

module.exports = async (req, res) => {
  if (!dbConnected) {
    await connectDatabase();
    dbConnected = true;
  }
  return app(req, res);
};
