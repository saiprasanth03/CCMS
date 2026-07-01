const express = require('express');
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint
} = require('../controllers/complaintsController');

const { protect, authorize } = require('../middleware/auth');

// Make token optional for some routes
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

const router = express.Router();

router.route('/')
  .get(optionalAuth, getComplaints)
  .post(protect, createComplaint);

router.route('/:id')
  .get(getComplaint)
  .delete(protect, authorize('admin', 'superadmin'), deleteComplaint);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateComplaintStatus);

module.exports = router;
