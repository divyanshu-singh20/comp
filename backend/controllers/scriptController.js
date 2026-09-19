const mongoose = require('mongoose');
const Script = require('../models/Script');

const scriptStatuses = [
  'Draft',
  'Assigned',
  'In Review',
  'Revision Required',
  'Ready for Shoot',
  'Approved',
  'Sent to Client'
];

const nextStatus = {
  Draft: 'Assigned',
  Assigned: 'In Review',
  'In Review': 'Revision Required',
  'Revision Required': 'Ready for Shoot',
  'Ready for Shoot': 'Approved',
  Approved: 'Sent to Client'
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const canMoveToStatus = (currentStatus, requestedStatus) => (
  currentStatus === requestedStatus
  || nextStatus[currentStatus] === requestedStatus
  || (requestedStatus === 'Revision Required'
    && ['Approved', 'Sent to Client'].includes(currentStatus))
);

const populateScript = (query) => query
  .populate('clientId', 'companyName contactName email')
  .populate('orderId', 'packageName contractedVideos status')
  .populate('writerId', 'name email role')
  .populate('creatorId', 'name availabilityStatus');

const createScript = async (request, response) => {
  try {
    const script = await Script.create(request.body);
    return response.status(201).json(await populateScript(Script.findById(script._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create script', error: error.message });
  }
};

const getScripts = async (request, response) => {
  try {
    const filter = {};
    if (request.query.clientId) filter.clientId = request.query.clientId;
    if (request.query.orderId) filter.orderId = request.query.orderId;
    if (request.query.status) filter.status = request.query.status;

    const scripts = await populateScript(Script.find(filter).sort({ deadline: 1, createdAt: -1 }));
    return response.json(scripts);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch scripts', error: error.message });
  }
};

const getScript = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid script id' });

    const script = await populateScript(Script.findById(request.params.id));
    if (!script) return response.status(404).json({ message: 'Script not found' });

    return response.json(script);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch script', error: error.message });
  }
};

const updateScript = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid script id' });

    const script = await Script.findById(request.params.id);
    if (!script) return response.status(404).json({ message: 'Script not found' });

    if (request.body.status && !canMoveToStatus(script.status, request.body.status)) {
      return response.status(409).json({
        message: `Invalid script transition from ${script.status} to ${request.body.status}`,
        allowedNextStatus: nextStatus[script.status] || null
      });
    }

    const updates = { ...request.body };
    delete updates.revisionCount;
    delete updates.feedbackLog;
    Object.assign(script, updates);
    await script.save();

    return response.json(await populateScript(Script.findById(script._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update script', error: error.message });
  }
};

const deleteScript = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid script id' });
    const script = await Script.findByIdAndDelete(request.params.id);
    if (!script) return response.status(404).json({ message: 'Script not found' });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete script', error: error.message });
  }
};

const addFeedback = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid script id' });
    const comment = typeof request.body.comment === 'string' ? request.body.comment.trim() : '';
    if (!comment) return response.status(400).json({ message: 'A feedback comment is required' });

    const script = await Script.findById(request.params.id);
    if (!script) return response.status(404).json({ message: 'Script not found' });

    script.feedbackLog.push({
      comment,
      authorId: request.user._id,
      source: request.user.role === 'Client' ? 'Client' : 'Internal'
    });
    await script.save();
    return response.json(await populateScript(Script.findById(script._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to add feedback', error: error.message });
  }
};

const requestRevision = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid script id' });
    const comment = typeof request.body.comment === 'string' ? request.body.comment.trim() : '';
    if (!comment) return response.status(400).json({ message: 'A revision comment is required' });

    const script = await Script.findById(request.params.id);
    if (!script) return response.status(404).json({ message: 'Script not found' });
    if (!canMoveToStatus(script.status, 'Revision Required')) {
      return response.status(409).json({ message: `Cannot request a revision from ${script.status}` });
    }

    script.revisionCount += 1;
    script.status = 'Revision Required';
    script.feedbackLog.push({
      comment,
      authorId: request.user._id,
      source: request.user.role === 'Client' ? 'Client' : 'Internal'
    });
    await script.save();
    return response.json(await populateScript(Script.findById(script._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to request revision', error: error.message });
  }
};

module.exports = {
  scriptStatuses,
  createScript,
  getScripts,
  getScript,
  updateScript,
  deleteScript,
  addFeedback,
  requestRevision
};
