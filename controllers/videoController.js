const mongoose = require('mongoose');
const Order = require('../models/Order');
const Video = require('../models/Video');

const pipelineStatuses = [
  'Script Approved',
  'Shoot Pending',
  'Raw Footage Received',
  'Video Editing',
  'Internal QA',
  'Client Review',
  'Revision',
  'Final Approved',
  'Delivered'
];

const nextPipelineStatus = pipelineStatuses.reduce((transitions, status, index) => {
  if (pipelineStatuses[index + 1]) transitions[status] = pipelineStatuses[index + 1];
  return transitions;
}, {});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateVideo = (query) => query
  .populate('clientId', 'companyName contactName email')
  .populate('orderId', 'packageName contractedVideos deliveredVideos remainingVideos status')
  .populate('scriptId', 'videoNumber status revisionCount')
  .populate('creatorId', 'name')
  .populate('shootId', 'date location status')
  .populate('editorId', 'name email role');

// Keep the order-level counter synchronized with the source of truth: delivered videos.
const syncOrderDeliveryCounter = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  const deliveredVideos = await Video.countDocuments({ orderId, status: 'Delivered' });
  order.deliveredVideos = deliveredVideos;
  order.remainingVideos = Math.max(order.contractedVideos - deliveredVideos, 0);
  if (order.status !== 'Cancelled') {
    if (deliveredVideos >= order.contractedVideos) order.status = 'Completed';
    else if (deliveredVideos > 0) order.status = 'Partially Delivered';
  }
  await order.save();
};

const createVideo = async (request, response) => {
  try {
    if (request.body.status && request.body.status !== 'Script Approved') {
      return response.status(409).json({ message: 'New videos must start at Script Approved' });
    }

    const video = await Video.create({ ...request.body, status: 'Script Approved' });
    return response.status(201).json(await populateVideo(Video.findById(video._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to create video', error: error.message });
  }
};

const getVideos = async (request, response) => {
  try {
    const filter = {};
    if (request.query.orderId) filter.orderId = request.query.orderId;
    if (request.query.status) filter.status = request.query.status;
    if (request.query.editorId) filter.editorId = request.query.editorId;

    const videos = await populateVideo(Video.find(filter).sort({ dueDate: 1, createdAt: -1 }));
    return response.json(videos);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch videos', error: error.message });
  }
};

const getVideo = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid video id' });
    const video = await populateVideo(Video.findById(request.params.id));
    if (!video) return response.status(404).json({ message: 'Video not found' });
    return response.json(video);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch video', error: error.message });
  }
};

const updateVideo = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid video id' });
    const video = await Video.findById(request.params.id);
    if (!video) return response.status(404).json({ message: 'Video not found' });

    if (request.body.status && request.body.status !== video.status) {
      if (nextPipelineStatus[video.status] !== request.body.status) {
        return response.status(409).json({
          message: `Invalid pipeline transition from ${video.status} to ${request.body.status}`,
          allowedNextStatus: nextPipelineStatus[video.status] || null
        });
      }
    }

    Object.assign(video, request.body);
    await video.save();
    await syncOrderDeliveryCounter(video.orderId);
    return response.json(await populateVideo(Video.findById(video._id)));
  } catch (error) {
    return response.status(400).json({ message: 'Unable to update video', error: error.message });
  }
};

const deleteVideo = async (request, response) => {
  try {
    if (!isValidId(request.params.id)) return response.status(400).json({ message: 'Invalid video id' });
    const video = await Video.findByIdAndDelete(request.params.id);
    if (!video) return response.status(404).json({ message: 'Video not found' });
    await syncOrderDeliveryCounter(video.orderId);
    return response.status(204).send();
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete video', error: error.message });
  }
};

const getEditorQueue = async (request, response) => {
  try {
    const filterType = request.query.filter || 'overdue';
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrowStart);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const filter = {};
    if (request.user.role === 'Editor') filter.editorId = request.user._id;
    else if (request.query.editorId) filter.editorId = request.query.editorId;

    if (filterType === 'completed') filter.status = 'Delivered';
    else if (filterType === 'overdue') {
      filter.status = { $ne: 'Delivered' };
      filter.dueDate = { $lt: todayStart };
    } else if (filterType === 'today') {
      filter.status = { $ne: 'Delivered' };
      filter.dueDate = { $gte: todayStart, $lt: tomorrowStart };
    } else if (filterType === 'tomorrow') {
      filter.status = { $ne: 'Delivered' };
      filter.dueDate = { $gte: tomorrowStart, $lt: dayAfterTomorrow };
    } else {
      return response.status(400).json({ message: 'filter must be overdue, today, tomorrow, or completed' });
    }

    return response.json(await populateVideo(Video.find(filter).sort({ dueDate: 1 })));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to fetch editor queue', error: error.message });
  }
};

module.exports = {
  pipelineStatuses,
  createVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  getEditorQueue,
  syncOrderDeliveryCounter
};
