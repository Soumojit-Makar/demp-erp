const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalEmployees, totalProducts, totalSales, salesData, recentSales, lowStockProducts] =
      await Promise.all([
        Employee.countDocuments({ status: 'active' }),
        Product.countDocuments({ status: 'active' }),
        Sale.countDocuments(),
        Sale.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Sale.find()
          .populate('product', 'name sku')
          .populate('createdBy', 'name')
          .sort({ createdAt: -1 })
          .limit(5),
        Product.find({ stock: { $lte: 10 }, status: 'active' }).sort({ stock: 1 }).limit(5),
      ]);

    const totalRevenue = salesData.length > 0 ? salesData[0].total : 0;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const monthlyRevenue = await Sale.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalProducts,
        totalSales,
        totalRevenue,
      },
      monthlyRevenue,
      recentSales,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
