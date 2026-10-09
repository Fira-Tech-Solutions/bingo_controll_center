const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { terminalAuth } = require('../middleware/terminalAuth');
const bingoCenterController = require('../controllers/bingoCenterController');
const onlineTopupController = require('../controllers/onlineTopupController');

const router = Router();

router.get('/', authenticate, bingoCenterController.list);
router.post('/', authenticate, requireRole('OPERATOR', 'ADMIN', 'AGENT'), bingoCenterController.create);
router.post('/recharge', authenticate, requireRole('OPERATOR', 'ADMIN', 'AGENT'), bingoCenterController.recharge);

router.get('/pending-balance', terminalAuth, onlineTopupController.getPendingBalance);
router.post('/claim-balance', terminalAuth, onlineTopupController.claimBalance);
router.post('/online-topup', authenticate, requireRole('OPERATOR', 'ADMIN', 'AGENT'), onlineTopupController.addOnlineTopup);
router.post('/regenerate-user-file', authenticate, requireRole('OPERATOR', 'ADMIN', 'AGENT'), bingoCenterController.regenerateUserFile);
router.delete('/:username', authenticate, requireRole('SUPER_ADMIN'), bingoCenterController.remove);

module.exports = router;
