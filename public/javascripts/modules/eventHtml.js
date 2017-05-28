import moment from 'moment';

moment.locale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s:  'seconds',
    ss: '%ss',
    m:  'a minute',
    mm: '%dm',
    h:  'an hour',
    hh: '%dh',
    d:  'a day',
    dd: '%dd',
    M:  'a month',
    MM: '%dM',
    y:  'a year',
    yy: '%dY'
  }
});

function getEventHtml(event) {
  var html = `
    <li class="tile">
      <div class="tile-content ink-reaction">
        <div class="tile-icon">
          <img src="${event.creator.google.profileImageUrl}">
        </div>
      <div class="tile-text">
        ${event.creator.google.name} ${event.typeDescription} <span>${moment(event.created).fromNow()}</span>
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