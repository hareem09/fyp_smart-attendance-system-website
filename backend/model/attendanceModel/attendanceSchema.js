// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({

  // Who
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which class/subject
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // When
  date: {
    type: Date,
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now     // exact timestamp of marking
  },

  // AI Verification Results
  faceConfidence: {
    type: Number,          // e.g. 0.94 (94%)
    min: 0,
    max: 1
  },
  livenessPass: {
    type: Boolean,
    default: false
  },
  geofencePass: {
    type: Boolean,
    default: false
  },

  // Location
  location: {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number }   // GPS accuracy in meters
  },

  // Status
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'manual'],
    default: 'present'
  },

  // Manual override info
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'             // if admin/teacher manually marked it
  },
  overrideReason: {
    type: String,
    trim: true
  },
  isManual: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// Prevent duplicate attendance for same student + subject + date
attendanceSchema.index(
  { student: 1, subject: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);