const mongoose = require('mongoose');
const Client = require('../models/Client');
const Order = require('../models/Order');
const Script = require('../models/Script');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Video = require('../models/Video');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getLoggedInClientId = (request) => request.user.role === 'Client' ? request.user.clientId : null;

const requirePortalClient = (request, response) => {
  const clientId = getLoggedInClientId(request);
  if (!clientId || !isValidId(clientId)) {
    response.status(403).json({ message: 'Your user is not linked to a client account' });
    return null;
  }
  return clientId;
};

const populateVideo = (query) => query
  .populate('orderId', 'packageName contractedVideos deliveredVideos remainingVideos status')
  .populate('scriptId', 'videoNumber status revisionCount')
  .populate('creatorId', 'name')
  .populate('editorId', 'name email');

const getPortalOverview = async (request, response) => {
  try {
    const clientId = requirePortalClient(request, response);
    if (!clientId) return;

    const [orders, videos, counts] = await Promise.all([
      Order.find({ clientId, status: { $nin: ['Completed', 'Cancelled'] } }).sort({ dueDate: 1 }),
      populateVideo(Video.find({ clientId }).sort({ dueDate: 1 })),
      Video.aggregate([
        { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return response.json({
      orders,
      videos,
      videoCounts: counts.reduce((result, item) => ({ ...result, [item._id]: item.count }), {})
    });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to load client portal', error: error.message });
  }
};

const validateEditor = async (editorId) => {
  if (!editorId || !isValidId(editorId)) return null;
  return User.findOne({ _id: editorId, role: 'Editor', status: 'Active' });
};

const decideVideo = async (request, response) => {
  try {
    const clientId = requirePortalClient(request, response);
    if (!clientId) return;
    if (!isValidId(request.params.videoId)) return response.status(400).json({ message: 'Invalid video id' });

    const { action, feedback, editorId } = request.body;
    if (!['approve', 'revision'].includes(action)) {
      return response.status(400).json({ message: 'action must be approve or revision' });
    }
    const comment = typeof feedback === 'string' ? feedback.trim() : '';
    if (action === 'revision' && !comment) {
      return response.status(400).json({ message: 'Feedback is required for a revision request' });
    }

    const video = await Video.findOne({ _id: request.params.videoId, clientId });
    if (!video) return response.status(404).json({ message: 'Video not found in your client portal' });

    if (action === 'approve' && video.status !== 'Client Review') {
      return response.status(409).json({ message: 'Only videos in Client Review can be approved' });
    }
    if (action === 'revision' && !['Client Review', 'Final Approved'].includes(video.status)) {
      return response.status(409).json({ message: 'Only videos in Client Review or Final Approved can be sent for revision' });
    }

    if (editorId) {
      if (!await validateEditor(editorId)) return response.status(400).json({ message: 'editorId must reference an active editor' });
      video.editorId = editorId;
    }

    if (comment) {
      video.feedbackLog.push({ comment, authorId: request.user._id, source: 'Client' });
    }
    if (action === 'revision') {
      video.status = 'Revision';
      video.revisionCount += 1;
      const script = await Script.findById(video.scriptId);
      if (script) {
        script.status = 'Revision Required';
        script.revisionCount += 1;
        if (comment) script.feedbackLog.push({ comment, authorId: request.user._id, source: 'Client' });
        await script.save();
      }
    } else {
      video.status = 'Final Approved';
    }

    await video.save();
    return response.json(await populateVideo(Video.findById(video._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to process video decision', error: error.message });
  }
};

const ticketScope = (request) => request.user.role === 'Client'
  ? { clientId: request.user.clientId || null }
  : {};

const createTicket = async (request, response) => {
  try {
    const clientId = request.user.role === 'Client' ? request.user.clientId : request.body.clientId;
    if (!clientId || !isValidId(clientId)) return response.status(400).json({ message: 'A valid clientId is required' });
    const ticket = await SupportTicket.create({
      ...request.body,
      clientId,
      createdBy: request.user._id,
      status: 'Open'
    });
    return response.status(201).json(ticket);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create support ticket', error: error.message });
  }
};

const getTickets = async (request, response) => {
  try {
    if (request.user.role === 'Client' && !requirePortalClient(request, response)) return;
    const filter = { ...ticketScope(request) };
    if (request.query.status) filter.status = request.query.status;
    return response.json(await SupportTicket.find(filter)
      .populate('clientId', 'companyName contactName email')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 }));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch support tickets', error: error.message });
  }
};

const getTicket = async (request, response) => {
  try {
    if (request.user.role === 'Client' && !requirePortalClient(request, response)) return;
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid ticket id' });
    const ticket = await SupportTicket.findOne({ _id: request.params.id, ...ticketScope(request) })
      .populate('clientId', 'companyName contactName email')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
    if (!ticket) return response.status(404).json({ message: 'Support ticket not found' });
    return response.json(ticket);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch support ticket', error: error.message });
  }
};

const updateTicket = async (request, response) => {
  try {
    if (request.user.role === 'Client' && !requirePortalClient(request, response)) return;
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid ticket id' });
    const ticket = await SupportTicket.findOne({ _id: request.params.id, ...ticketScope(request) });
    if (!ticket) return response.status(404).json({ message: 'Support ticket not found' });

    if (request.user.role === 'Client') {
      const allowedUpdates = {};
      if (request.body.subject !== undefined) allowedUpdates.subject = request.body.subject;
      if (request.body.message !== undefined) allowedUpdates.message = request.body.message;
      Object.assign(ticket, allowedUpdates);
    } else {
      Object.assign(ticket, request.body);
    }
    await ticket.save();
    return response.json(ticket);
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update support ticket', error: error.message });
  }
};

const deleteTicket = async (request, response) => {
  try {
    if (request.user.role === 'Client' && !requirePortalClient(request, response)) return;
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid ticket id' });
    const ticket = await SupportTicket.findOneAndDelete({ _id: request.params.id, ...ticketScope(request) });
    if (!ticket) return response.status(404).json({ message: 'Support ticket not found' });
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete support ticket', error: error.message });
  }
};

module.exports = {
  getPortalOverview,
  decideVideo,
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket
};
