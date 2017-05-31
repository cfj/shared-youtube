import '../sass/style.scss';
import axios from 'axios';

import { $, $$ } from './modules/bling';
import { getYouTubeVideoId, getYouTubePlaylistId } from './modules/getYoutubeVideoId'
import { getEventHtml, appendEventHtml } from './modules/eventHtml'
import { moment } from './modules/configuredMoment';

var tag = document.createElement('script');
var currentVideoTitle = '';

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var pausedViaSocket = false;
var playedViaSocket = false;
var changeVideoViaSocket = false;
var changedVolumeViaSocket = false;
var textSearch = false;
var container = $('.video-container');
var currentVideo;
var initialPlay;
var currentVolume = 0;
var playerConfig = {
  height: container.clientWidth / 1.7777777777,
  width: container.clientWidth,
  videoId: '7-n4bxxn9gA', // Todo: ta bort på nåt sätt
  events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
  },
  playerVars: {
    autoplay: 1,
    enablejsapi: 1,
    iv_load_policy: 3,
    rel: 1
  }
};

function createYoutubePlayerFromSearch(video, playbackType) {
  if (playbackType.type === 'single') {
    playerConfig.videoId = video;
    player = new YT.Player('player', playerConfig);
  } else {
    player = new YT.Player('player', playerConfig);
    playerConfig.videoId = 'EMfKa1jStE8';
    player.loadPlaylist({
      list: video,
      listType: playbackType.type
    });
  }
}

function createYoutubePlayer(video) {
  if (!video.playlist || !video.playlist.length) {
    playerConfig.videoId = video.videoId;
  } else {
    playerConfig.videoId = video.playlist[video.playlistIndex];
  }

  player = new YT.Player('player', playerConfig);
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
// Need to explicitly put this on the window object since it needs to be in the global scope
window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  axios
    .get('/api/videos/latest')
    .then(res => {
      if (res.data && res.data.videoId) {
        initialPlay = true;
        currentVideo = res.data;
        createYoutubePlayer(res.data);
      }
    })
    .catch(err => {
      console.log(err);
    });
}

function storeVideoHistory(video) {
  axios
    .post('/api/video', video)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
}

function storeEvent(event) {
  delete event.created; // Let the database set the real value of this
  axios
    .post('/api/event', event)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  player.mute(); // Start muted
  event.target.playVideo();

  if (currentVideo.playlist) {
    player.loadPlaylist(currentVideo.playlist, currentVideo.playlistIndex);
  }
}

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  console.log('player state changed');
  var videoId = getYouTubeVideoId(player.getVideoUrl()); // event.target.getVideoData().video_id;
  var videoTitle = event.target.getVideoData().title;

  var newVideo = {
    videoId: videoId,
    title: videoTitle
  };

  if (player.getPlaylist() && player.getPlaylist().length) {
    newVideo.playlist = player.getPlaylist();
    newVideo.playlistIndex = player.getPlaylistIndex();
  }

  console.log('currentVideo', currentVideo);
  console.log('newVideo', newVideo);

  if (currentVideo.videoId !== newVideo.videoId && !changeVideoViaSocket) {
    socket.emit('changing video', newVideo);
    storeVideoHistory(newVideo);
  }

  currentVideo = newVideo;

  document.title = videoTitle;

  switch (event.data) {
    case YT.PlayerState.PLAYING:
      var event = {
        type: 'play',
        typeDescription: 'played',
        created: new Date().toISOString(),
        videoId,
        videoTitle
      };
      if (!playedViaSocket && !initialPlay) {
        socket.emit('play', event);
        storeEvent(event);
      }
      initialPlay = false;
      break;
    case YT.PlayerState.PAUSED:
      var event = {
        type: 'pause',
        typeDescription: 'paused',
        created: new Date().toISOString(),
        videoId,
        videoTitle
      };
      if (!pausedViaSocket) {
        socket.emit('pause', event);
        storeEvent(event);
      }
      break;
  }
  
  playedViaSocket = false;
  pausedViaSocket = false;
  changeVideoViaSocket = false;
}

function changeVideo(video, playbackType) {
  if (!player) {
    createYoutubePlayerFromSearch(video, playbackType);
    return;
  }

  switch (playbackType.type) {
    case 'single':
      player.loadVideoById({
        videoId: video
      });
      break;
    case 'playlist':
      player.loadPlaylist({
        list: video,
        listType: 'playlist'
      });
      break;
    case 'search':
      player.loadPlaylist({
        list: video,
        listType: 'search'
      });
      break;
  }
}

function pauseVideo() {
  player.pauseVideo();
}

function playVideo() {
  player.playVideo();
}

var searchInput = $('#search-input');

searchInput.on('keyup', function(e) {
  if (e.keyCode === 13) {
    var url = this.value;

    if (!url.startsWith('http')) {
      // Wasn't a url then but a text search
      changeVideo(url, { type: 'search' });
    } else {
      var playlistId = getYouTubePlaylistId(url);
      var videoId = getYouTubeVideoId(url);

      if (playlistId) {
        changeVideo(playlistId, { type: 'playlist' });
      } else {
        changeVideo(videoId, { type: 'single' });
      }
    }

    this.value = '';
  }
});

var socket = io();

socket.on('pause', (e) => {
  console.log('pausing the video via socket', e);
  pausedViaSocket = true;
  pauseVideo();
  appendEventHtml(getEventHtml(e), '.list');
});

socket.on('play', (e) => {
  console.log('playing the video via socket', e);
  playedViaSocket = true;
  playVideo();
  appendEventHtml(getEventHtml(e), '.list');
});

socket.on('changing video', (video) => {
  console.log('changing video to' + video.videoId);
  changeVideoViaSocket = true;

  if (video.playlist && video.playlist.length) {
    player.loadPlaylist(video.playlist, video.playlistIndex);
  } else {
    player.loadVideoById({
      videoId: video.videoId
    });
  }
});

socket.on('volume', (e) => {
  console.log('setting volume to ', e);
  changedVolumeViaSocket = true;
  player.setVolume(e);
});

/*
 * Keep times updated
*/

window.setInterval(() => {
  $$('span[data-timestamp]').forEach((element) => {
    element.innerText = moment(element.getAttribute('data-timestamp')).fromNow();
  });
}, 60000);


/*
 * Load video when clicking the video title in the playback history
*/

$('.events-container .list').on('click', (e) => {
  if (e.target && e.target.nodeName === "A") {
    e.preventDefault();
    let videoId = e.target.href.split('#')[1];
    console.log('clicked, videoId is', videoId);
    changeVideo(videoId, false);
  }
});

/*
 * Monitor the volume
*/

window.setInterval(() => {
  var volume = player.getVolume();
  if (volume !== currentVolume) {
    currentVolume = volume;
    if (!changedVolumeViaSocket) {
      socket.emit('volume', volume);
    }
    
    changedVolumeViaSocket = false;
  }
}, 1000);