const express = require('express');
const router = express.Router();
const { getSalesReport, getInventoryReport, getEmployeeReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);
router.get('/employees', getEmployeeReport);

module.exports = router;
