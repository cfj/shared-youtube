function getEventHtml(event) {
  console.log(event);
  var html = `
    <div class="event">
      <div class="event__user">
        <img src="${event.creator.google.profileImageUrl}" width="40" height="40">
      </div>
      <div class="event__description">
        <div>
          ${event.creator.google.name} ${event.typeDescription} <a href="#${event.videoId}">${event.videoTitle}</a>
        </div>
      </div>
    </div>
  `;

  return html;
}

function appendEventHtml(html, selector) {
  var elementToAppendTo = document.querySelector(selector);

  elementToAppendTo.innerHTML = html + elementToAppendTo.innerHTML;
}

export {
  getEventHtml,
  appendEventHtml
}