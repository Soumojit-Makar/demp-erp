const express = require('express');
const router = express.Router();
const { getAllSales, getSale, createSale, updateSale, deleteSale } = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllSales);
router.get('/:id', getSale);
router.post('/', authorize('admin', 'manager'), createSale);
router.put('/:id', authorize('admin', 'manager'), updateSale);
router.delete('/:id', authorize('admin'), deleteSale);

module.exports = router;
