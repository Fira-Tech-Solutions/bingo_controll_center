const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const agentController = require('../controllers/agentController');

const router = Router();

// Admin/SuperAdmin management of agents
router.get('/', authenticate, requireRole('ADMIN'), agentController.listAgents);
router.post('/', authenticate, requireRole('ADMIN'), agentController.createAgent);
router.put('/:username/ban', authenticate, requireRole('ADMIN'), agentController.toggleBan);
router.put('/:username/reset-password', authenticate, requireRole('ADMIN'), agentController.resetPassword);
router.delete('/:username', authenticate, requireRole('ADMIN'), agentController.remove);

// Center assignment management
router.post('/assign-center', authenticate, requireRole('ADMIN'), agentController.assignCenter);
router.delete('/:agent_username/centers/:center_username', authenticate, requireRole('ADMIN'), agentController.unassignCenter);
router.get('/:username/assignments', authenticate, requireRole('ADMIN'), agentController.getAgentAssignments);

// Agent-scoped endpoints (agent sees only their assigned data)
router.get('/my/centers', authenticate, requireRole('AGENT'), agentController.listAssignedCenters);
router.get('/my/centers/:username', authenticate, requireRole('AGENT'), agentController.getCenterDetail);
router.get('/my/transactions', authenticate, requireRole('AGENT'), agentController.getScopedTransactions);
router.get('/my/analytics', authenticate, requireRole('AGENT'), agentController.getScopedAnalytics);
router.get('/my/packages', authenticate, requireRole('AGENT'), agentController.getAssignedPackages);

module.exports = router;
