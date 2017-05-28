import { moment } from './configuredMoment';

function getEventHtml(event) {
  console.log(event);
  var html = `
    <li class="tile">
      <div class="tile-content ink-reaction">
        <div class="tile-icon">
          <img src="${event.creator.google.profileImageUrl}">
        </div>
      <div class="tile-text">
        ${event.creator.google.name} ${event.typeDescription} <span data-timestamp="${event.created}" title="${event.created}">${moment(event.created).fromNow()}</span>
        <small>
          <a href="#${event.videoId}">${event.videoTitle}</a></small>
        </div>
      </div>
    </li>
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