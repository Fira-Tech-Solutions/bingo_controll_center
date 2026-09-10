const { Package, RechargeHistory } = require('../models');
const { fn, col } = require('sequelize');
const logger = require('../utils/logger');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Package.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: rows.map((p) => ({
        id: p.id,
        name: p.name,
        paymentAmount: parseFloat(p.payment_amount),
        balanceAmount: parseFloat(p.balance_amount),
        description: p.description,
        isActive: p.is_active,
        isBonus: p.is_bonus,
        createdBy: p.created_by,
        usageCount: p.usage_count,
        createdAt: p.createdAt || p.created_at,
        updatedAt: p.updatedAt || p.updated_at,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.listActive = async (req, res, next) => {
  try {
    const packages = await Package.findAll({
      where: { is_active: true },
      order: [['payment_amount', 'ASC']],
    });

    res.json({
      success: true,
      data: packages.map((p) => ({
        id: p.id,
        name: p.name,
        paymentAmount: parseFloat(p.payment_amount),
        balanceAmount: parseFloat(p.balance_amount),
        description: p.description,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, payment_amount, balance_amount, description, is_bonus } = req.body;

    if (!name || payment_amount == null || balance_amount == null) {
      return res.status(400).json({ success: false, error: 'name, payment_amount, and balance_amount are required' });
    }

    const existing = await Package.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Package name already exists' });
    }

    const pkg = await Package.create({
      name,
      payment_amount: payment_amount,
      balance_amount: balance_amount,
      description: description || null,
      is_bonus: is_bonus || false,
      created_by: req.user.username,
    });

    logger.info(`Package created: ${pkg.name} by ${req.user.username}`);

    res.status(201).json({
      success: true,
      data: {
        id: pkg.id,
        name: pkg.name,
        paymentAmount: parseFloat(pkg.payment_amount),
        balanceAmount: parseFloat(pkg.balance_amount),
        description: pkg.description,
        isActive: pkg.is_active,
        isBonus: pkg.is_bonus,
        createdBy: pkg.created_by,
        usageCount: pkg.usage_count,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, payment_amount, balance_amount, description, is_bonus } = req.body;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    if (name && name !== pkg.name) {
      const existing = await Package.findOne({ where: { name } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Package name already exists' });
      }
    }

    await pkg.update({
      name: name ?? pkg.name,
      payment_amount: payment_amount ?? pkg.payment_amount,
      balance_amount: balance_amount ?? pkg.balance_amount,
      description: description ?? pkg.description,
      is_bonus: is_bonus ?? pkg.is_bonus,
    });

    res.json({
      success: true,
      data: {
        id: pkg.id,
        name: pkg.name,
        paymentAmount: parseFloat(pkg.payment_amount),
        balanceAmount: parseFloat(pkg.balance_amount),
        description: pkg.description,
        isActive: pkg.is_active,
        isBonus: pkg.is_bonus,
        createdBy: pkg.created_by,
        usageCount: pkg.usage_count,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    await pkg.update({ is_active: !pkg.is_active });

    res.json({
      success: true,
      data: {
        id: pkg.id,
        name: pkg.name,
        isActive: pkg.is_active,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    const usageStats = await RechargeHistory.findAll({
      attributes: [
        'package_id',
        [fn('COUNT', col('id')), 'total_uses'],
        [fn('SUM', col('actual_amount')), 'total_payment'],
        [fn('SUM', col('generated_amount')), 'total_balance'],
      ],
      where: { package_id: id },
      group: ['package_id'],
      raw: true,
    });

    const stats = usageStats[0] || { total_uses: 0, total_payment: 0, total_balance: 0 };

    res.json({
      success: true,
      data: {
        packageId: pkg.id,
        name: pkg.name,
        totalUses: parseInt(stats.total_uses, 10),
        totalPayment: parseFloat(stats.total_payment || 0),
        totalBalanceGenerated: parseFloat(stats.total_balance || 0),
      },
    });
  } catch (err) {
    next(err);
  }
};
