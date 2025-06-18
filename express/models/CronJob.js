const mongoose = require('mongoose');

const CronJobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the schedule.'],
    trim: true,
    unique: true,
  },
  schedule: {
    type: String,
    required: [true, 'Please provide a cron schedule string.'],
    trim: true,
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CronJob', CronJobSchema); 