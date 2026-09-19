const mongoose = require('mongoose');
const Creator = require('../models/Creator');
const Shoot = require('../models/Shoot');

const activeShootStatuses = ['Scheduled', 'Confirmed', 'In Progress', 'Reshoot Required'];
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getDayRange = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
};

const assertCreatorCanBook = async (creatorId, date, currentShootId) => {
  const creator = await Creator.findById(creatorId);
  if (!creator) return 'Assigned creator not found';
  if (['Unavailable', 'On Hold'].includes(creator.availabilityStatus)) {
    return `Creator is currently ${creator.availabilityStatus.toLowerCase()}`;
  }

  const conflictFilter = {
    assignedCreator: creatorId,
    date: getDayRange(date),
    status: { $in: activeShootStatuses }
  };
  if (currentShootId) conflictFilter._id = { $ne: currentShootId };
  const conflict = await Shoot.exists(conflictFilter);
  return conflict ? 'Creator already has an active shoot on this date' : null;
};

const populateShoot = (query) => query
  .populate('clientId', 'companyName contactName email')
  .populate('orderId', 'packageName status')
  .populate('scriptId', 'videoNumber status')
  .populate('assignedCreator', 'name languages niches availabilityStatus')
  .populate('cameraman', 'name email role')
  .populate('shootManager', 'name email role');

const createShoot = async (request, response) => {
  try {
    const { assignedCreator, date } = request.body;
    const creatorError = await assertCreatorCanBook(assignedCreator, date);
    if (creatorError) return response.status(409).json({ message: creatorError });

    const shoot = await Shoot.create(request.body);
    return response.status(201).json(await populateShoot(Shoot.findById(shoot._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create shoot', error: error.message });
  }
};

const getShoots = async (request, response) => {
  try {
    const filter = {};
    if (request.query.status) filter.status = request.query.status;
    if (request.query.assignedCreator) filter.assignedCreator = request.query.assignedCreator;
    if (request.query.date) filter.date = getDayRange(request.query.date);

    const shoots = await populateShoot(Shoot.find(filter).sort({ date: 1 }));
    return response.json(shoots);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch shoots', error: error.message });
  }
};

const getShoot = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid shoot id' });
    const shoot = await populateShoot(Shoot.findById(request.params.id));
    if (!shoot) return response.status(404).json({ message: 'Shoot not found' });
    return response.json(shoot);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch shoot', error: error.message });
  }
};

const updateShoot = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid shoot id' });
    const shoot = await Shoot.findById(request.params.id);
    if (!shoot) return response.status(404).json({ message: 'Shoot not found' });

    const creatorId = request.body.assignedCreator || shoot.assignedCreator;
    const date = request.body.date || shoot.date;
    if (request.body.assignedCreator || request.body.date || request.body.status) {
      const creatorError = await assertCreatorCanBook(creatorId, date, shoot._id);
      if (creatorError && request.body.status !== 'Cancelled' && request.body.status !== 'Completed') {
        return response.status(409).json({ message: creatorError });
      }
    }

    Object.assign(shoot, request.body);
    await shoot.save();
    return response.json(await populateShoot(Shoot.findById(shoot._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update shoot', error: error.message });
  }
};

const deleteShoot = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid shoot id' });
    const shoot = await Shoot.findByIdAndDelete(request.params.id);
    if (!shoot) return response.status(404).json({ message: 'Shoot not found' });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete shoot', error: error.message });
  }
};

module.exports = { createShoot, getShoots, getShoot, updateShoot, deleteShoot };
