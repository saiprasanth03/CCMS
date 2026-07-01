const Complaint = require('../models/Complaint');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public/Private (Users see their own or public, Admin sees all)
exports.getComplaints = async (req, res) => {
  try {
    let query;

    // Admin sees based on jurisdiction, users see their own
    if (req.user && req.user.role === 'admin') {
      const level = req.user.adminLevel;
      const j = req.user.jurisdiction;
      
      let filter = {};
      
      if (level === 'state') filter = { 'location.state': j.state };
      else if (level === 'district') filter = { 'location.state': j.state, 'location.district': j.district };
      else if (level === 'mandal') filter = { 'location.state': j.state, 'location.district': j.district, 'location.mandal': j.mandal };
      else if (level === 'village') filter = { 'location.state': j.state, 'location.district': j.district, 'location.pincode': j.pincode };
      // superadmin (or if no level is set) gets {} which means all
      
      query = Complaint.find(filter).populate('user', 'fullName email phoneNumber');
    } else if (req.user && req.user.role === 'user') {
      query = Complaint.find({ user: req.user.id });
    } else {
      // Public view
      query = Complaint.find({ status: { $ne: 'Rejected' } }).populate('user', 'fullName');
    }

    const complaints = await query;

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('comments.user', 'fullName role');

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Add initial status to timeline
    req.body.statusTimeline = [
      {
        status: 'Submitted',
        note: 'Complaint submitted successfully'
      }
    ];

    const complaint = await Complaint.create(req.body);

    // Emit socket event
    if (req.io) {
      req.io.emit('newComplaint', complaint);
    }

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Update status
    complaint.status = req.body.status;
    
    // Add to timeline
    complaint.statusTimeline.push({
      status: req.body.status,
      note: req.body.note || `Status updated to ${req.body.status}`
    });

    await complaint.save();

    // Emit socket event
    if (req.io) {
      req.io.emit('statusUpdate', complaint);
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
