const bcrypt = require('bcryptjs');
const { User, Session } = require('../models');
const logger = require('../utils/logger');

exports.list = async (req, res, next) => {
  try {
    const admins = await User.findAll({
      where: { role: 'ADMIN' },
      attributes: ['username', 'full_name', 'email', 'role', 'profile_pic_url', 'is_banned', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({
      success: true,
      data: admins.map((a) => ({
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

exports.create = async (req, res, next) => {
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
    const admin = await User.create({
      username,
      full_name,
      email,
      password: hash,
      role: 'ADMIN',
      profile_pic_url: profile_pic_url || null,
      is_banned: false,
    });

    logger.info(`Admin created: ${admin.username}`);

    res.status(201).json({
      success: true,
      data: {
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        profile_pic_url: admin.profile_pic_url,
        isBanned: admin.is_banned,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleBan = async (req, res, next) => {
  try {
    const { username } = req.params;
    const admin = await User.findOne({ where: { username, role: 'ADMIN' } });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    admin.is_banned = !admin.is_banned;
    await admin.save();

    if (admin.is_banned) {
      await Session.update(
        { is_valid: false },
        { where: { user_id: admin.id, is_valid: true } },
      );
      logger.info(`Admin ${admin.username} banned – sessions invalidated`);
    } else {
      logger.info(`Admin ${admin.username} unbanned`);
    }

    res.json({
      success: true,
      data: {
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        isBanned: admin.is_banned,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { username } = req.params;
    const admin = await User.findOne({ where: { username, role: 'ADMIN' } });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    await Session.update(
      { is_valid: false },
      { where: { user_id: admin.id, is_valid: true } },
    );

    await admin.destroy();
    logger.info(`Admin removed: ${username}`);
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

    const admin = await User.findOne({ where: { username, role: 'ADMIN' } });
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    logger.info(`Password reset for admin ${admin.username}`);
    res.json({ success: true, data: true });
  } catch (err) {
    next(err);
  }
};
