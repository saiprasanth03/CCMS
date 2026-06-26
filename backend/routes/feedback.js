const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @desc    Submit platform feedback
// @route   POST /api/feedback
// @access  Private (Developers/Admins)
router.post('/', protect, async (req, res) => {
  try {
    const { type, message } = req.body;
    
    const feedback = await Feedback.create({
      user: req.user.id,
      type,
      message
    });
    
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
