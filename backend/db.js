const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL;
if (!mongoURL) {
  console.error('MONGODB_URL is not set. Add it to backend/.env (local) or the service environment (Render).');
}

// Tests use an in-memory stand-in for the models, so they skip the real connection.
if (process.env.SKIP_DB_CONNECT !== 'true') mongoose
  .connect(mongoURL || 'mongodb://127.0.0.1:27017/company-prep-hub', { serverSelectionTimeoutMS: 15000 })
  .catch((err) => console.log('mongodb connection error:', err.message));

const db = mongoose.connection;

db.on('connected', () => {
  console.log('mongodb connection successfully');
});

db.on('error', (err) => {
  console.log('mongodb connection error:', err);
});

db.on('disconnected', () => {
  console.log('Mongodb disconnected');
});

module.exports = db;
