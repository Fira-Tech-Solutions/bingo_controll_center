const { RechargeHistory, Package } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.debitedBy) {
      where.debited_by = req.query.debitedBy;
    }
    const transactions = await RechargeHistory.findAll({
      where,
      include: [{ model: Package, as: 'package', attributes: ['id', 'name', 'payment_amount', 'balance_amount'] }],
      order: [['timestamp', 'DESC']],
    });
    res.json({
      success: true,
      data: transactions.map((t) => ({
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
