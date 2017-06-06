function getSearchResultHtml(item) {
  var html = `
    <li class="tile">
      <a href="#${item.id.videoId || item.id.playlistId}" data-type="${item.id.kind}">
        <div class="tile-content">
          <img src="${item.thumbnails.default.url}">
        </div>
        <div class="tile-text">
          ${item.title}
          <small>${item.description}</small>
        </div>
      </a>
    </li>`;

  return html;
}

export {
  getSearchResultHtml
}