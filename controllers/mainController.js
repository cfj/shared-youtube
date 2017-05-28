const mongoose = require('mongoose');
const Video = mongoose.model('Video');
const Event = mongoose.model('Event');
const axios = require('axios');

exports.homePage = async (req, res) => {
  if (req.user) console.log(req.user);
  var events = await Event.find({}, null, {sort: {created: -1}}).limit(10).populate('creator');
  res.render('index', {
    events
  });
};

exports.storeVideo = async (req, res) => {
  let title = req.body.title;
  if (!req.body.title) {
    var youtubeData = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${req.body.videoId}&key=${process.env.YOUTUBE_KEY}&part=snippet`);
    title = youtubeData.data.items[0].snippet.title;
  }

  var video = {
    videoId: req.body.videoId,
    title
  };

  if (req.body.playlist) {
    video.playlist = req.body.playlist;
    video.playlistIndex = req.body.playlistIndex;
  }

  console.log('storing video', video);

  const storedVideo = await (new Video(video)).save();

  res.json(storedVideo);
};

exports.getLatestVideo = async (req, res) => {
  var video = await Video.findOne().sort({ field: 'asc', _id: -1 }).limit(1);

  res.json(video);
};

exports.storeEvent = async (req, res, next) => {
  let event = req.body;
  event.creator = req.user;
  var storedEvent = await new Event(event).save();

  res.json(storedEvent);
};

exports.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
    return;
  }

  res.status(401)
     .send('Requires authentication. Please log in.');
};