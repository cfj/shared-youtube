import '../sass/style.scss';
import axios from 'axios';

import { $, $$ } from './modules/bling';
import { getYouTubeVideoId } from './modules/getYoutubeVideoId'
import { getEventHtml, appendEventHtml } from './modules/eventHtml'

var tag = document.createElement('script');
var currentVideoTitle = '';

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var pausedViaSocket = false;
var playedViaSocket = false;
var changeVideoViaSocket = false;
var textSearch = false;
var container = $('.video-container');
var currentVideo;
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

function createYoutubePlayerFromSearch(video, isPlaylist) {
  if (!isPlaylist) {
    playerConfig.videoId = video;
    player = new YT.Player('player', playerConfig);
  } else {
    player = new YT.Player('player', playerConfig);
    playerConfig.videoId = 'EMfKa1jStE8';
    player.loadPlaylist({
      list: video,
      listType: 'search'
    });
  }
}

function createYoutubePlayer(video) {
  if (!video.playlist) {
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
      console.error(err);
    });
}

function storeEvent(event) {
  axios
    .post('/api/event', event)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //player.mute(); // Start muted
  event.target.playVideo();

  if (currentVideo.playlist) {
    player.loadPlaylist(currentVideo.playlist, currentVideo.playlistIndex);
  }
}

// 5. The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
  console.log('player state changed');
  var videoId = event.target.getVideoData().video_id;
  var videoTitle = event.target.getVideoData().title;

  if (currentVideo !== videoId && !changeVideoViaSocket) {
    let video = {
      videoId: videoId,
      title: videoTitle
    };

    if (player.getPlaylist()) {
      video.playlist = player.getPlaylist();
      video.playlistIndex = player.getPlaylistIndex();
    }

    socket.emit('changing video', video);
    storeVideoHistory(video);
  }

  currentVideo = videoId;

  document.title = videoTitle;

  console.log(player.getPlaylist());
  console.log(player.getPlaylistIndex());

  switch(event.data) {
    case YT.PlayerState.PLAYING:
      var event = {
        type: 'play',
        typeDescription: 'played',
        videoId,
        videoTitle
      };
      if (!playedViaSocket) {
        storeEvent(event);
        socket.emit('play', event);
      }
      break;
    case YT.PlayerState.PAUSED:
      var event = {
        type: 'pause',
        typeDescription: 'paused',
        videoId,
        videoTitle
      };
      if (!pausedViaSocket) {
        storeEvent(event);
        socket.emit('pause', event);
      }
      break;
  }

  playedViaSocket = false;
  pausedViaSocket = false;
  changeVideoViaSocket = false;
}

function changeVideo(video, isPlaylist) {
  if (!player) {
    createYoutubePlayerFromSearch(video, isPlaylist);
    return;
  }

  if (isPlaylist) {
    player.loadPlaylist({
      list: video,
      listType: 'search'
    });
  } else {
    player.loadVideoById({
      videoId: video
    });
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
    var videoId = getYouTubeVideoId(url);

    if (!url.startsWith('http')) {
      // Wasn't a url then but a text search
      changeVideo(videoId, true);
    } else {
      changeVideo(videoId, false);
    }

    this.value = '';
  }
});

var socket = io();

socket.on('pause', (e) => {
  console.log('pausing the video via socket', e);
  pausedViaSocket = true;
  pauseVideo();
  appendEventHtml(getEventHtml(e), '.events');
});

socket.on('play', (e) => {
  console.log('playing the video via socket', e);
  playedViaSocket = true;
  playVideo();
  appendEventHtml(getEventHtml(e), '.events');
});

socket.on('changing video', (video) => {
  console.log('changing video to' + video.videoId);
  changeVideoViaSocket = true;

  if (video.playlist) {
    player.loadPlaylist(video.playlist, video.playlistIndex);
  } else {
    player.loadVideoById({
      videoId: video
    });
  }
});