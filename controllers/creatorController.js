const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Shoot = require('../models/Shoot');

const activeShootStatuses = ['Scheduled', 'Confirmed', 'In Progress', 'Reshoot Required'];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const withWorkload = async (creator) => {
  const activeShootCount = await Shoot.countDocuments({
    assignedCreator: creator._id,
    status: { $in: activeShootStatuses }
  });

  return {
    ...creator.toObject(),
    workload: { activeShootCount }
  };
};

const createCreator = async (request, response) => {
  try {
    const creator = await Creator.create(request.body);
    return response.status(201).json(await withWorkload(creator));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create creator', error: error.message });
  }
};

const getCreators = async (request, response) => {
  try {
    const filter = {};
    if (request.query.availabilityStatus) filter.availabilityStatus = request.query.availabilityStatus;
    const creators = await Creator.find(filter).sort({ name: 1 });
    return response.json(await Promise.all(creators.map(withWorkload)));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch creators', error: error.message });
  }
};

const getCreator = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid creator id' });
    const creator = await Creator.findById(request.params.id).select('+bankDetails');
    if (!creator) return response.status(404).json({ message: 'Creator not found' });
    return response.json(await withWorkload(creator));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch creator', error: error.message });
  }
};

const updateCreator = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid creator id' });
    const creator = await Creator.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    }).select('+bankDetails');
    if (!creator) return response.status(404).json({ message: 'Creator not found' });
    return response.json(await withWorkload(creator));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update creator', error: error.message });
  }
};

const deleteCreator = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid creator id' });
    const activeShoot = await Shoot.exists({
      assignedCreator: request.params.id,
      status: { $in: activeShootStatuses }
    });
    if (activeShoot) return response.status(409).json({ message: 'Creator has active shoots and cannot be deleted' });

    const creator = await Creator.findByIdAndDelete(request.params.id);
    if (!creator) return response.status(404).json({ message: 'Creator not found' });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete creator', error: error.message });
  }
};

module.exports = { createCreator, getCreators, getCreator, updateCreator, deleteCreator };
