const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('admin', 'manager'), getAllEmployees);
router.get('/:id', authorize('admin', 'manager'), getEmployee);
router.post('/', authorize('admin', 'manager'), createEmployee);
router.put('/:id', authorize('admin', 'manager'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
