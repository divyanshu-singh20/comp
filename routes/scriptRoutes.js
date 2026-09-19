const express = require('express');
const {
  addFeedback,
  createScript,
  deleteScript,
  getScript,
  getScripts,
  requestRevision,
  updateScript
} = require('../controllers/scriptController');
const { checkRole, verifyToken } = require('../middleware/auth');

const router = express.Router();
const canManageScripts = checkRole(['Owner', 'Admin', 'ScriptWriter', 'ShootManager']);

router.use(verifyToken, canManageScripts);
router.get('/', getScripts);
router.get('/:id', getScript);
router.post('/', createScript);
router.patch('/:id', updateScript);
router.delete('/:id', checkRole(['Owner', 'Admin']), deleteScript);
router.post('/:id/feedback', addFeedback);
router.post('/:id/revisions', requestRevision);

module.exports = router;
