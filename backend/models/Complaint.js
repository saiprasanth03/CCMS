const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a complaint title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Garbage',
      'Road Damage',
      'Drainage',
      'Water Leakage',
      'Street Light',
      'Electricity',
      'Pollution',
      'Illegal Construction',
      'Noise Complaint',
      'Animal Issues',
      'Public Safety',
      'Other'
    ]
  },
  location: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    mandal: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: Number,
    lng: Number
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  images: {
    type: [String],
    default: []
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: [
      'Submitted',
      'Verified',
      'Assigned',
      'In Progress',
      'Resolved',
      'Rejected',
      'Closed'
    ],
    default: 'Submitted'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  assignedOfficer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  statusTimeline: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
