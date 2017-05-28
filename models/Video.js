const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  videoId: String,
  playlist: {
    type: Array,
    required: false
  },
  playlistIndex: {
    type: Number,
    required: false
  }
});

module.exports = mongoose.model('Video', videoSchema);