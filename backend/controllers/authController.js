const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get token from model, create response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isFirstLogin: user.isFirstLogin,
      adminLevel: user.adminLevel
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, address, language } = req.body;

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      address,
      language
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user or admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate identifier & password
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email or system ID and password' });
    }

    // Check for user by email OR systemId
    const user = await User.findOne({
      $or: [{ email: identifier }, { systemId: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Setup Admin First Time Login
// @route   POST /api/auth/setup-admin
// @access  Private (Admin only)
exports.setupAdminProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    user.email = email;
    user.isFirstLogin = false;
    if (password) {
      user.password = password;
    }
    
    await user.save();
    
    res.status(200).json({ success: true, data: 'Admin setup completed successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Register multiple admins (Bulk upload)
// @route   POST /api/auth/register-admin-bulk
// @access  Private (Superadmin only)
exports.registerAdminsBulk = async (req, res) => {
  try {
    // Only superadmin can create other admins
    if (req.user.adminLevel !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to perform bulk admin creation' });
    }

    const { admins } = req.body;
    
    if (!admins || !Array.isArray(admins) || admins.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an array of admin objects' });
    }

    const generatedAdmins = [];

    // Process sequentially to ensure unique IDs (could optimize with bulk insert, but sequential is safer for unique constraints)
    for (const adminData of admins) {
      const { adminLevel, state, district, mandal, village, pincode } = adminData;

      // Ensure required fields
      if (!adminLevel || !state) continue;

      let location = { state };
      if (adminLevel === 'district' || adminLevel === 'mandal' || adminLevel === 'village') location.district = district;
      if (adminLevel === 'mandal' || adminLevel === 'village') location.mandal = mandal;
      if (adminLevel === 'village') {
        location.city = village; // Map village to city field
        location.pincode = pincode;
      }

      // Generate a secure temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

      // Generate a sequential System ID based on admin level
      const count = await User.countDocuments({ role: 'admin', adminLevel });
      const systemId = `${adminLevel.toUpperCase()}_${String(count + 1).padStart(3, '0')}`;

      // Create new admin object
      const admin = new User({
        role: 'admin',
        adminLevel,
        systemId,
        password: tempPassword,
        location,
        isFirstLogin: true,
        isApproved: true,
        email: `placeholder_${Date.now()}_${Math.random().toString(36).substring(7)}@gov.in` // Temporary email to satisfy schema constraints
      });

      // Save admin (this will trigger pre-save hook to hash password)
      await admin.save();

      generatedAdmins.push({
        systemId,
        password: tempPassword,
        adminLevel,
        location
      });
    }

    res.status(201).json({ success: true, data: generatedAdmins });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create a new admin
// @route   POST /api/auth/register-admin
// @access  Private (Superadmin only)
exports.registerAdmin = async (req, res) => {
  try {
    // Only superadmin can create other admins (or we can relax it later)
    if (!req.user || req.user.adminLevel !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Not authorized to create admins' });
    }

    const { fullName, phoneNumber, address, adminLevel, jurisdiction } = req.body;
    
    // Generate system ID based on jurisdiction
    let systemId = '';
    const j = jurisdiction || {};
    if (adminLevel === 'state') systemId = `state_${j.state}`;
    else if (adminLevel === 'district') systemId = `dist_${j.district}_${j.state}`;
    else if (adminLevel === 'mandal') systemId = `mdl_${j.mandal}_${j.district}_${j.state}`;
    else if (adminLevel === 'village') systemId = `vil_${j.village}_${j.district}_${j.state}_${j.pincode}`;
    
    // Clean systemId (lowercase, remove spaces)
    systemId = systemId.toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Generate random password
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const user = await User.create({
      fullName,
      systemId,
      phoneNumber,
      password,
      address,
      role: 'admin',
      adminLevel,
      jurisdiction,
      isFirstLogin: true
    });

    res.status(201).json({
      success: true,
      data: {
        systemId,
        password,
        adminLevel
      }
    });
  } catch (err) {
    // Check if unique constraint on systemId failed
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'An admin for this specific jurisdiction already exists.' });
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phoneNumber, address },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    // sendTokenResponse(user, 200, res); // We don't have to send a token back unless we want to, but sending success is enough
    res.status(200).json({ success: true, data: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
const sendEmail = require('../utils/sendEmail');

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'There is no user with that email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving (for security)
    const salt = await require('bcryptjs').genSalt(10);
    user.resetPasswordOtp = await require('bcryptjs').hash(otp, salt);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `Your password reset OTP is: ${otp}\nIt is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message
      });

      res.status(200).json({ success: true, data: 'OTP sent to email (and terminal)' });
    } catch (err) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ 
      email,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isMatch = await require('bcryptjs').compare(otp, user.resetPasswordOtp);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

