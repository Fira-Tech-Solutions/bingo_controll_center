const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const packageController = require('../controllers/packageController');

const router = Router();

router.get('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), packageController.list);
router.get('/active', authenticate, packageController.listActive);
router.post('/', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), packageController.create);
router.put('/:id', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), packageController.update);
router.patch('/:id/toggle', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), packageController.toggleActive);
router.get('/:id/usage', authenticate, requireRole('SUPER_ADMIN', 'ADMIN'), packageController.getUsage);

module.exports = router;
