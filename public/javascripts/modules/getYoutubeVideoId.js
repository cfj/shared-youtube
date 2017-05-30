// https://gist.github.com/takien/4077195

function getYouTubeVideoId (url) {
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = url;
  }
  
  return ID;
}

function getYouTubePlaylistId (url) {
  var reg = /[&?]list=([a-z0-9_]+)/i;
  var match = reg.exec(url);

  if (match && match[1].length){
    return match[1];
  } else {
    return null;
  }
}

export {
  getYouTubeVideoId,
  getYouTubePlaylistId
}