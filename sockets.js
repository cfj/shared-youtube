const mongoose = require('mongoose');
const Event = mongoose.model('Event');
const Video = mongoose.model('Video');

exports.onConnect = (io) => (socket) => {
  console.log('a user connected');

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('pause', function(eventData) {
    console.log('somebody paused the video');
    if (socket.request.user) {
      eventData.creator = socket.request.user;
      io.emit('pause', eventData);

      delete eventData.created
      let event = eventData;
      event.creator = socket.request.user;
      var storedEvent = new Event(event).save();
    }
  });

  socket.on('play', function(eventData) {
    console.log('somebody played the video');
    if (socket.request.user) {
      eventData.creator = socket.request.user;
      io.emit('play', eventData);

      delete eventData.created
      let event = eventData;
      event.creator = socket.request.user;
      var storedEvent = new Event(event).save();
    }
  });

  /*
  socket.on('seek', function(seconds) {
    console.log('seeking to ' + seconds);
    socket.broadcast.emit('seek', seconds);
    // nice to have
  });
  */

  socket.on('changing video', (video) => {
    console.log('somebody changed the video to ' + video.videoId);
    if (socket.request.user) {
      socket.broadcast.emit('changing video', video);
    }
  });

  socket.on('volume', (volume) => {
    console.log('somebody changed the volume to ' + volume);
    if (socket.request.user) {
      socket.broadcast.emit('volume', volume);
    }
  });
};