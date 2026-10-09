const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { User, BingoCenter, RechargeHistory, OnlineTopup, AgentCenterAssignment, Package } = require('../models');
const { fn, col } = require('sequelize');
const logger = require('../utils/logger');

exports.listAssignedCenters = async (req, res, next) => {
  try {
    const assignments = await AgentCenterAssignment.findAll({
      where: { agent_username: req.user.username },
      include: [{ model: BingoCenter, attributes: ['id', 'full_name', 'username', 'mac_address', 'balance', 'owner_name', 'phone', 'address', 'region', 'created_at'] }],
      order: [['created_at', 'DESC']],
    });

    const centerUsernames = assignments.map(a => a.center_username);

    const balances = {};
    if (centerUsernames.length > 0) {
      const results = await RechargeHistory.findAll({
        attributes: ['bingo_center_username', [fn('COALESCE', fn('SUM', col('actual_amount')), 0), 'total']],
        where: { bingo_center_username: centerUsernames },
        group: ['bingo_center_username'],
        raw: true,
      });
      results.forEach(r => { balances[r.bingo_center_username] = parseFloat(r.total); });
    }

    const onlineBalances = {};
    if (centerUsernames.length > 0) {
      const topups = await OnlineTopup.findAll({
        where: { username: centerUsernames },
        raw: true,
      });
      topups.forEach(t => {
        onlineBalances[t.username] = {
          balance: parseFloat(t.balance),
          actual_balance: parseFloat(t.actual_balance),
          paid_balance: parseFloat(t.paid_balance),
        };
      });
    }

    res.json({
      success: true,
      data: assignments.map(a => ({
        userID: a.BingoCenter.id,
        full_name: a.BingoCenter.full_name,
        username: a.BingoCenter.username,
        balance: balances[a.BingoCenter.username] || 0,
        mac_address: a.BingoCenter.mac_address,
        createdBy: a.BingoCenter.created_by,
        createdAt: a.BingoCenter.createdAt || a.BingoCenter.created_at,
        owner_name: a.BingoCenter.owner_name,
        phone: a.BingoCenter.phone,
        address: a.BingoCenter.address,
        region: a.BingoCenter.region,
        onlineBalance: onlineBalances[a.BingoCenter.username]?.balance || 0,
        onlineActualBalance: onlineBalances[a.BingoCenter.username]?.actual_balance || 0,
        onlinePaidBalance: onlineBalances[a.BingoCenter.username]?.paid_balance || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getCenterDetail = async (req, res, next) => {
  try {
    const { username } = req.params;

    const assignment = await AgentCenterAssignment.findOne({
      where: { agent_username: req.user.username, center_username: username },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Center not assigned to you' });
    }

    const center = await BingoCenter.findOne({ where: { username } });
    if (!center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    const totalRecharged = await RechargeHistory.sum('actual_amount', { where: { bingo_center_username: username } }) || 0;
    const topup = await OnlineTopup.findOne({ where: { username } });

    res.json({
      success: true,
      data: {
        userID: center.id,
        full_name: center.full_name,
        username: center.username,
        balance: totalRecharged,
        mac_address: center.mac_address,
        createdBy: center.created_by,
        createdAt: center.createdAt || center.created_at,
        owner_name: center.owner_name,
        phone: center.phone,
        additional_contact: center.additional_contact,
        address: center.address,
        region: center.region,
        notes: center.notes,
        onlineBalance: parseFloat(topup?.balance || 0),
        onlineActualBalance: parseFloat(topup?.actual_balance || 0),
        onlinePaidBalance: parseFloat(topup?.paid_balance || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getScopedTransactions = async (req, res, next) => {
  try {
    const assignments = await AgentCenterAssignment.findAll({
      where: { agent_username: req.user.username },
      attributes: ['center_username'],
      raw: true,
    });

    const centerUsernames = assignments.map(a => a.center_username);
    if (centerUsernames.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const where = { bingo_center_username: { [Op.in]: centerUsernames } };
    if (req.query.bingoCenterUsername) {
      if (!centerUsernames.includes(req.query.bingoCenterUsername)) {
        return res.json({ success: true, data: [] });
      }
      where.bingo_center_username = req.query.bingoCenterUsername;
    }

    const transactions = await RechargeHistory.findAll({
      where,
      include: [{ model: Package, as: 'package', attributes: ['id', 'name', 'payment_amount', 'balance_amount'] }],
      order: [['timestamp', 'DESC']],
    });

    res.json({
      success: true,
      data: transactions.map(t => ({
        id: t.id,
        actualAmount: t.actual_amount,
        generatedAmount: t.generated_amount,
        bingoCenterUsername: t.bingo_center_username,
        debitedBy: t.debited_by,
        packageId: t.package_id,
        package: t.package ? {
          id: t.package.id,
          name: t.package.name,
          paymentAmount: t.package.payment_amount,
          balanceAmount: t.package.balance_amount,
        } : null,
        timestamp: t.timestamp,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getScopedAnalytics = async (req, res, next) => {
  try {
    const assignments = await AgentCenterAssignment.findAll({
      where: { agent_username: req.user.username },
      attributes: ['center_username'],
      raw: true,
    });

    const centerUsernames = assignments.map(a => a.center_username);
    if (centerUsernames.length === 0) {
      return res.json({ success: true, data: { totalBalance: 0, activeCenters: 0, todayGeneratedTopups: 0 } });
    }

    const [totalBalanceResult, activeCenters, todayGeneratedTopups] = await Promise.all([
      RechargeHistory.sum('actual_amount', {
        where: { bingo_center_username: { [Op.in]: centerUsernames } },
      }),
      AgentCenterAssignment.count({ where: { agent_username: req.user.username } }),
      RechargeHistory.sum('generated_amount', {
        where: {
          bingo_center_username: { [Op.in]: centerUsernames },
          timestamp: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
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

exports.getAssignedPackages = async (req, res, next) => {
  try {
    const packages = await Package.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'payment_amount', 'balance_amount', 'description', 'is_bonus', 'usage_count'],
      order: [['payment_amount', 'ASC']],
    });

    res.json({
      success: true,
      data: packages.map(p => ({
        id: p.id,
        name: p.name,
        paymentAmount: parseFloat(p.payment_amount),
        balanceAmount: parseFloat(p.balance_amount),
        description: p.description,
        isBonus: p.is_bonus,
        usageCount: p.usage_count,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.listAgents = async (req, res, next) => {
  try {
    const agents = await User.findAll({
      where: { role: 'AGENT' },
      attributes: ['username', 'full_name', 'email', 'role', 'profile_pic_url', 'is_banned', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({
      success: true,
      data: agents.map(a => ({
        username: a.username,
        full_name: a.full_name,
        email: a.email,
        role: a.role,
        profile_pic_url: a.profile_pic_url,
        isBanned: a.is_banned,
        createdAt: a.createdAt || a.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const { username, full_name, email, password, profile_pic_url } = req.body;

    if (!username || !full_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All required fields must be provided' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const agent = await User.create({
      username,
      full_name,
      email,
      password: hash,
      role: 'AGENT',
      profile_pic_url: profile_pic_url || null,
      is_banned: false,
    });

    logger.info(`Agent created: ${agent.username}`);

    res.status(201).json({
      success: true,
      data: {
        username: agent.username,
        full_name: agent.full_name,
        email: agent.email,
        role: agent.role,
        profile_pic_url: agent.profile_pic_url,
        isBanned: agent.is_banned,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleBan = async (req, res, next) => {
  try {
    const { username } = req.params;
    const agent = await User.findOne({ where: { username, role: 'AGENT' } });
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    agent.is_banned = !agent.is_banned;
    await agent.save();

    if (agent.is_banned) {
      const { Session } = require('../models');
      await Session.update(
        { is_valid: false },
        { where: { user_id: agent.id, is_valid: true } },
      );
      logger.info(`Agent ${agent.username} banned – sessions invalidated`);
    } else {
      logger.info(`Agent ${agent.username} unbanned`);
    }

    res.json({
      success: true,
      data: {
        username: agent.username,
        full_name: agent.full_name,
        email: agent.email,
        role: agent.role,
        isBanned: agent.is_banned,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { username } = req.params;
    const agent = await User.findOne({ where: { username, role: 'AGENT' } });
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const { Session } = require('../models');
    await Session.update(
      { is_valid: false },
      { where: { user_id: agent.id, is_valid: true } },
    );
    await AgentCenterAssignment.destroy({ where: { agent_username: username } });
    await agent.destroy();
    logger.info(`Agent removed: ${username}`);

    res.json({ success: true, data: true });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const agent = await User.findOne({ where: { username, role: 'AGENT' } });
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    agent.password = await bcrypt.hash(newPassword, 10);
    await agent.save();

    logger.info(`Password reset for agent ${agent.username}`);
    res.json({ success: true, data: true });
  } catch (err) {
    next(err);
  }
};

exports.assignCenter = async (req, res, next) => {
  try {
    const { agent_username, center_username } = req.body;

    if (!agent_username || !center_username) {
      return res.status(400).json({ success: false, error: 'agent_username and center_username are required' });
    }

    const agent = await User.findOne({ where: { username: agent_username, role: 'AGENT' } });
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const center = await BingoCenter.findOne({ where: { username: center_username } });
    if (!center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    const existing = await AgentCenterAssignment.findOne({
      where: { agent_username, center_username },
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Center already assigned to this agent' });
    }

    const assignment = await AgentCenterAssignment.create({
      agent_username,
      center_username,
      assigned_by: req.user.username,
    });

    logger.info(`Center ${center_username} assigned to agent ${agent_username} by ${req.user.username}`);

    res.status(201).json({ success: true, data: { id: assignment.id, agent_username, center_username, assigned_by: assignment.assigned_by } });
  } catch (err) {
    next(err);
  }
};

exports.unassignCenter = async (req, res, next) => {
  try {
    const { agent_username, center_username } = req.params;

    const assignment = await AgentCenterAssignment.findOne({
      where: { agent_username, center_username },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    await assignment.destroy();
    logger.info(`Center ${center_username} unassigned from agent ${agent_username}`);

    res.json({ success: true, data: true });
  } catch (err) {
    next(err);
  }
};

exports.getAgentAssignments = async (req, res, next) => {
  try {
    const { username } = req.params;

    const assignments = await AgentCenterAssignment.findAll({
      where: { agent_username: username },
      attributes: ['id', 'agent_username', 'center_username', 'assigned_by', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};
