const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = Router();

router.get('/', authenticate, requireRole('SUPER_ADMIN'), adminController.list);
router.post('/', authenticate, requireRole('SUPER_ADMIN'), adminController.create);
router.put('/:username/ban', authenticate, requireRole('SUPER_ADMIN'), adminController.toggleBan);
router.put('/:username/reset-password', authenticate, requireRole('SUPER_ADMIN'), adminController.resetPassword);
router.delete('/:username', authenticate, requireRole('SUPER_ADMIN'), adminController.remove);

module.exports = router;
