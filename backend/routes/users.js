const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users and admins
// @access  Private (Admins only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -resetPasswordOtp -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user or admin account
// @access  Private (Superadmin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.user.adminLevel !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Only Super Admins can delete user accounts' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
