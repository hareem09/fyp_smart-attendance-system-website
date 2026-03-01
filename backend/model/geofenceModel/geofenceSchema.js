// models/Geofence.js
const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true             // e.g. "Main Campus", "Block A"
  },
  description: {
    type: String,
    trim: true
  },

  // Center point of the geofence
  center: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },

  // Allowed radius in meters
  radius: {
    type: Number,
    required: true,
    default: 100           // 100 meters default
  },

  // Who created it
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Which subjects use this geofence
  applicableSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Geofence', geofenceSchema);