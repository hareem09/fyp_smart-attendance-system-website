// models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true             // e.g. "Database Systems"
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true             // e.g. "CS-401"
  },
  creditHours: {
    type: Number,
    default: 3
  },
  department: {
    type: String,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },

  // Assigned teacher
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Enrolled students
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Class schedule
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    startTime: { type: String },   // e.g. "09:00"
    endTime: { type: String }      // e.g. "10:30"
  }],

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);