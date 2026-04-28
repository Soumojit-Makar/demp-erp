const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Admin, Manager
const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate('product', 'name sku category price')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const summary = {
      totalOrders: sales.length,
      totalRevenue: sales.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.totalAmount, 0),
      pendingPayments: sales.filter((s) => s.paymentStatus === 'pending').length,
      deliveredOrders: sales.filter((s) => s.orderStatus === 'delivered').length,
    };

    res.json({ success: true, summary, sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Admin, Manager
const getInventoryReport = async (req, res, next) => {
  try {
    const [allProducts, lowStockProducts, categoryStats] = await Promise.all([
      Product.find().sort({ stock: 1 }),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' }, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } },
        { $sort: { totalValue: -1 } },
      ]),
    ]);

    const summary = {
      totalProducts: allProducts.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: allProducts.filter((p) => p.stock === 0).length,
      totalInventoryValue: allProducts.reduce((sum, p) => sum + p.price * p.stock, 0),
    };

    res.json({ success: true, summary, lowStockProducts, categoryStats, allProducts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee report
// @route   GET /api/reports/employees
// @access  Admin, Manager
const getEmployeeReport = async (req, res, next) => {
  try {
    const [allEmployees, departmentStats] = await Promise.all([
      Employee.find().sort({ department: 1, name: 1 }),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' }, totalSalary: { $sum: '$salary' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const summary = {
      totalEmployees: allEmployees.length,
      activeEmployees: allEmployees.filter((e) => e.status === 'active').length,
      onLeave: allEmployees.filter((e) => e.status === 'on-leave').length,
      totalSalaryBudget: allEmployees.reduce((sum, e) => sum + e.salary, 0),
    };

    res.json({ success: true, summary, departmentStats, allEmployees });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getInventoryReport, getEmployeeReport };
