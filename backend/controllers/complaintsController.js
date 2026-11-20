const Complaint = require('../models/Complaint');

// Helper to escape regex special characters
const escapeRegex = (text) => (text || '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Helper to match state (handles AP <=> Andhra Pradesh, etc.)
const getStateRegex = (stateStr) => {
  if (!stateStr) return null;
  const s = stateStr.trim();
  if (/^(ap|andhra\s*pradesh|a\.p\.)$/i.test(s)) {
    return /^(ap|andhra\s*pradesh|a\.p\.)$/i;
  }
  if (/^(ts|telangana|t\.s\.)$/i.test(s)) {
    return /^(ts|telangana|t\.s\.)$/i;
  }
  return new RegExp(`^\\s*${escapeRegex(s)}\\s*$`, 'i');
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public/Private (Users see their own or public, Admin sees all)
exports.getComplaints = async (req, res) => {
  try {
    let query;

    // Admin sees based on jurisdiction, users see their own
    if (req.user && req.user.role === 'admin') {
      const level = req.user.adminLevel;
      const j = req.user.jurisdiction || req.user.location || {};
      
      let filter = {};
      
      if (level === 'superadmin') {
        filter = {}; // Superadmin sees all complaints
      } else if (level === 'village') {
        // Pincode / Village level authority
        const pincode = (j.pincode || '').trim();
        const village = (j.village || j.city || '').trim();

        if (pincode && village) {
          filter.$or = [
            { 'location.pincode': { $regex: new RegExp(`^\\s*${escapeRegex(pincode)}\\s*$`, 'i') } },
            { 'location.city': { $regex: new RegExp(`^\\s*${escapeRegex(village)}\\s*$`, 'i') } }
          ];
        } else if (pincode) {
          filter['location.pincode'] = { $regex: new RegExp(`^\\s*${escapeRegex(pincode)}\\s*$`, 'i') };
        } else if (village) {
          filter['location.city'] = { $regex: new RegExp(`^\\s*${escapeRegex(village)}\\s*$`, 'i') };
        }
      } else if (level === 'mandal') {
        const mandal = (j.mandal || '').trim();
        if (mandal) {
          filter['location.mandal'] = { $regex: new RegExp(`^\\s*${escapeRegex(mandal)}\\s*$`, 'i') };
        }
        if (j.district && j.district.trim()) {
          filter['location.district'] = { $regex: new RegExp(`^\\s*${escapeRegex(j.district.trim())}\\s*$`, 'i') };
        }
      } else if (level === 'district') {
        const district = (j.district || '').trim();
        if (district) {
          filter['location.district'] = { $regex: new RegExp(`^\\s*${escapeRegex(district)}\\s*$`, 'i') };
        }
        const stateRegex = getStateRegex(j.state);
        if (stateRegex) {
          filter['location.state'] = { $regex: stateRegex };
        }
      } else if (level === 'state') {
        const stateRegex = getStateRegex(j.state);
        if (stateRegex) {
          filter['location.state'] = { $regex: stateRegex };
        }
      }

      query = Complaint.find(filter).sort({ createdAt: -1 }).populate('user', 'fullName email phoneNumber');
    } else if (req.user && req.user.role === 'user') {
      query = Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    } else {
      // Public view
      query = Complaint.find({ status: { $ne: 'Rejected' } }).sort({ createdAt: -1 }).populate('user', 'fullName');
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

    // Clean and trim location strings if provided
    if (req.body.location) {
      ['street', 'city', 'mandal', 'district', 'state', 'pincode'].forEach(field => {
        if (typeof req.body.location[field] === 'string') {
          req.body.location[field] = req.body.location[field].trim();
        }
      });
    }

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
