const { Op } = require('sequelize');
const { BingoCenter, RechargeHistory, AgentCenterAssignment } = require('../models');

async function getAgentAssignedCenterUsernames(agentUsername) {
  const assignments = await AgentCenterAssignment.findAll({
    where: { agent_username: agentUsername },
    attributes: ['center_username'],
    raw: true,
  });
  return assignments.map(a => a.center_username);
}

exports.getSystemAnalytics = async (req, res, next) => {
  try {
    let centerFilter = {};
    if (req.user.role === 'AGENT') {
      const assigned = await getAgentAssignedCenterUsernames(req.user.username);
      if (assigned.length === 0) {
        return res.json({ success: true, data: { totalBalance: 0, activeCenters: 0, todayGeneratedTopups: 0 } });
      }
      centerFilter = { bingo_center_username: { [Op.in]: assigned } };
    }

    const [totalBalanceResult, activeCenters, todayGeneratedTopups] = await Promise.all([
      RechargeHistory.sum('actual_amount', { where: centerFilter }),
      req.user.role === 'AGENT'
        ? AgentCenterAssignment.count({ where: { agent_username: req.user.username } })
        : BingoCenter.count(),
      RechargeHistory.sum('generated_amount', {
        where: {
          ...centerFilter,
          timestamp: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalBalance: parseFloat(totalBalanceResult || '0'),
        activeCenters,
        todayGeneratedTopups: parseFloat(todayGeneratedTopups || '0'),
      },
    });
  } catch (err) {
    next(err);
  }
};
