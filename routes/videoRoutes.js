const express = require('express');
const {
  createVideo,
  deleteVideo,
  getEditorQueue,
  getVideo,
  getVideos,
  updateVideo
} = require('../controllers/videoController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const canManageVideos = checkRole(['Owner', 'Admin', 'Editor', 'ShootManager']);

router.use(verifyToken, canManageVideos);
router.get('/queue', getEditorQueue);
router.get('/', getVideos);
router.get('/:id', getVideo);
router.post('/', createVideo);
router.patch('/:id', updateVideo);
router.delete('/:id', checkRole(['Owner', 'Admin']), deleteVideo);

module.exports = router;
