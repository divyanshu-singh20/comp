require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./db');
const User = require('./models/User');

const defaultOwner = {
  name: process.env.SEED_OWNER_NAME || 'Leadyfy Owner',
  email: (process.env.SEED_OWNER_EMAIL || 'owner@leadyfy.com').toLowerCase(),
  password: process.env.SEED_OWNER_PASSWORD || 'ChangeMe@Leadyfy2026'
};

const ownerPermissions = [
  'clients:read',
  'clients:write',
  'orders:read',
  'orders:write',
  'scripts:read',
  'scripts:write',
  'creators:read',
  'creators:write',
  'shoots:read',
  'shoots:write',
  'videos:read',
  'videos:write',
  'finance:read',
  'finance:write',
  'users:read',
  'users:write',
  'reports:read'
];

const seed = async () => {
  await connectDB();

  const existingOwner = await User.findOne({ email: defaultOwner.email }).select('+passwordHash');
  if (existingOwner) {
    console.log(`Default owner already exists: ${existingOwner.email}`);
    return;
  }

  await User.create({
    name: defaultOwner.name,
    email: defaultOwner.email,
    passwordHash: await bcrypt.hash(defaultOwner.password, 12),
    role: 'Owner',
    permissions: ownerPermissions,
    status: 'Active'
  });

  console.log(`Default owner created: ${defaultOwner.email}`);
};

seed()
  .catch((error) => {
    console.error('Unable to seed default owner:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });