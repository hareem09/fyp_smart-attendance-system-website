// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({

  // only one settings document exists in the DB
  singleton: {
    type: Boolean,
    default: true,
    unique: true
  },

  // Face recognition
  faceConfidenceThreshold: {
    type: Number,
    default: 0.85          // 85% minimum confidence
  },

  // Attendance window
  // prevents marking attendance twice in same class
  attendanceWindowMinutes: {
    type: Number,
    default: 60            // 60 minutes between markings per subject
  },

  // Liveness
  livenessTimeoutSeconds: {
    type: Number,
    default: 10            // user has 10 seconds to blink
  },
  livenessBlinkCount: {
    type: Number,
    default: 1             // number of blinks required
  },

  // Low attendance alert threshold
  lowAttendanceThreshold: {
    type: Number,
    default: 75            // alert if student below 75%
  },

  // Late arrival window (minutes after class start)
  lateWindowMinutes: {
    type: Number,
    default: 15
  },

  // Model info
  lastModelTrainedAt: {
    type: Date
  },
  modelAccuracy: {
    type: Number           // last recorded SVM accuracy e.g. 0.96
  }

}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);