const pause = (e) => {
  console.log('clicking pause');
  socket.emit('pause');
};

const play = (e) => {
  console.log('clicking play');
  socket.emit('play');
};

const change = (videoId) => () => {
  console.log(`changing video to ${videoId}`);
  socket.emit('changing video', videoId);
};

export {
  pause,
  play,
  change
};