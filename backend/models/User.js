const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined to not conflict on uniqueness
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  systemId: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  adminLevel: {
    type: String,
    enum: ['superadmin', 'state', 'district', 'mandal', 'village'],
    default: 'village'
  },
  jurisdiction: {
    state: String,
    district: String,
    mandal: String,
    village: String,
    pincode: String
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'English'
  },
  resetPasswordOtp: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
