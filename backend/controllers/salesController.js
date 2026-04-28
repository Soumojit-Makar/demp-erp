const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getAllSales = async (req, res, next) => {
  try {
    const { paymentStatus, orderStatus, search } = req.query;
    const query = {};

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderStatus) query.orderStatus = orderStatus;
    if (search) {
      query.$or = [{ customerName: { $regex: search, $options: 'i' } }];
    }

    const sales = await Sale.find(query)
      .populate('product', 'name sku price')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: sales.length, sales });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
const getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('product', 'name sku price category')
      .populate('createdBy', 'name email');
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Admin, Manager
const createSale = async (req, res, next) => {
  try {
    const { product: productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    const totalAmount = product.price * quantity;

    const sale = await Sale.create({
      ...req.body,
      totalAmount,
      createdBy: req.user._id,
    });

    // Reduce stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    const populatedSale = await Sale.findById(sale._id)
      .populate('product', 'name sku price')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, message: 'Sale created successfully', sale: populatedSale });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Admin, Manager
const updateSale = async (req, res, next) => {
  try {
    const { paymentStatus, orderStatus } = req.body;
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, orderStatus },
      { new: true, runValidators: true }
    )
      .populate('product', 'name sku price')
      .populate('createdBy', 'name email');

    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, message: 'Sale updated successfully', sale });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Admin
const deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSales, getSale, createSale, updateSale, deleteSale };
