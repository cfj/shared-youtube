function getSearchResultHtml(item) {
  var html = `
    <li class="tile">
      <a href="#${item.id.videoId || item.id.playlistId}" data-type="${item.id.kind}">
        <div class="tile-content">
          <div class="pull-left">
            <img src="${item.thumbnails.default.url}">
          </div>
          <div class="tile-text">
            ${item.title}
            <small>${item.description}</small>
          </div>
        </div>
      </a>
    </li>`;

  return html;
}

export {
  getSearchResultHtml
}