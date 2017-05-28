const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const eventSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  type: String,
  typeDescription: String,
  videoId: String,
  videoTitle: String
});

module.exports = mongoose.model('Event', eventSchema);