const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $sendLocationBtn = document.querySelector('#send-location');
const $messageFormBtn = document.querySelector('button');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector(
  '#location-message-template'
  ).innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild

  // height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  // how far have I Scroll
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
}

socket.on('message', ({ text, createdAt, username }) => {
  const html = Mustache.render($messageTemplate, {
    message: text,
    createdAt: moment(createdAt).format('h:mm a'),
    username
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});

socket.on('locationMessage', ({ url, createdAt, username }) => {
  const html = Mustache.render($locationTemplate, {
    message: url,
    createdAt: moment(createdAt).format('h:mm a'),
    username
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll()
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormBtn.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;
  socket.emit('sendMessage', message, (error) => {
    $messageFormBtn.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

$sendLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }
  $sendLocationBtn.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    const coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    socket.emit('sendLocation', coordinates, () => {
      console.log('Location shared');
      $sendLocationBtn.removeAttribute('disabled');
    });
  });
});

socket.emit('join', {username, room}, (error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html
})
