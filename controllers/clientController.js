const mongoose = require('mongoose');
const Client = require('../models/Client');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateCompanyName = (companyName) => (
  typeof companyName === 'string' && companyName.trim().length > 0
);

// Create a client only after validating the field required by the Mongoose schema.
const createClient = async (request, response) => {
  try {
    if (!validateCompanyName(request.body.companyName)) {
      return response.status(400).json({ message: 'companyName is required and must be a non-empty string' });
    }

    const client = await Client.create({
      ...request.body,
      companyName: request.body.companyName.trim()
    });

    return response.status(201).json(client);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create client', error: error.message });
  }
};

// Return clients with the assigned employee's safe display fields.
const getClients = async (request, response) => {
  try {
    const clients = await Client.find()
      .populate('assignedEmployee', 'name email role')
      .sort({ createdAt: -1 });

    return response.json(clients);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch clients', error: error.message });
  }
};

// Fetch one client by id with an explicit ObjectId check for a clean 400 response.
const getClient = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid client id' });
    }

    const client = await Client.findById(request.params.id)
      .populate('assignedEmployee', 'name email role');

    if (!client) {
      return response.status(404).json({ message: 'Client not found' });
    }

    return response.json(client);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch client', error: error.message });
  }
};

// Validate companyName on partial updates before running Mongoose validators.
const updateClient = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid client id' });
    }

    if ('companyName' in request.body && !validateCompanyName(request.body.companyName)) {
      return response.status(400).json({ message: 'companyName must be a non-empty string' });
    }

    const updates = { ...request.body };
    if (updates.companyName) updates.companyName = updates.companyName.trim();

    const client = await Client.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('assignedEmployee', 'name email role');

    if (!client) {
      return response.status(404).json({ message: 'Client not found' });
    }

    return response.json(client);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update client', error: error.message });
  }
};

// Delete a client and return the conventional empty success response.
const deleteClient = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) {
      return response.status(400).json({ message: 'Invalid client id' });
    }

    const client = await Client.findByIdAndDelete(request.params.id);

    if (!client) {
      return response.status(404).json({ message: 'Client not found' });
    }

    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete client', error: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient
};
