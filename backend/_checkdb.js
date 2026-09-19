// Temporary connectivity check for the configured MONGODB_URI.
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db');

const run = async () => {
  await connectDB();

  const admin = mongoose.connection.db.admin();
  const ping = await admin.ping();
  const collections = await mongoose.connection.db.listCollections().toArray();

  console.log('ping:', JSON.stringify(ping));
  console.log('database:', mongoose.connection.name);
  console.log('host:', mongoose.connection.host);
  console.log('collections:', collections.map((c) => c.name).join(', ') || '(none yet)');
};

run()
  .catch((error) => {
    console.error('Connection check failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
