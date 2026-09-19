const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const User = require('../models/User');
const {
  allowedRoles,
  comparePassword,
  hashPassword
} = require('../middleware/auth');

const publicRegistrationRoles = ['Client', 'ScriptWriter', 'ShootManager', 'Editor'];

const createToken = (user) => jwt.sign(
  { userId: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// Register a user while keeping the stored credential as a one-way hash.
const register = async (request, response) => {
  try {
    const {
      name,
      email,
      password,
      role = 'Client',
      permissions = [],
      clientId
    } = request.body;

    if (!name || !email || !password) {
      return response.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return response.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (!allowedRoles.includes(role)) {
      return response.status(400).json({ message: 'Invalid user role' });
    }

    if (!publicRegistrationRoles.includes(role)) {
      return response.status(403).json({ message: 'Owner and Admin accounts must be provisioned through the seed or admin workflow' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (role === 'Client' && clientId) {
      const client = await Client.findOne({ _id: clientId, email: normalizedEmail });
      if (!client) {
        return response.status(400).json({ message: 'clientId must belong to a client with the same email' });
      }
    }
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return response.status(409).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role,
      permissions,
      clientId: role === 'Client' ? clientId : undefined
    });

    return response.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      },
      token: createToken(user)
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to register user', error: error.message });
  }
};

// Load the password hash explicitly because the User schema excludes it by default.
const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
    const passwordMatches = user && await comparePassword(password, user.passwordHash);

    if (!user || !passwordMatches || user.status !== 'Active') {
      return response.status(401).json({ message: 'Invalid email or password' });
    }

    return response.json({
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status
      }
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to log in', error: error.message });
  }
};

module.exports = { register, login };
