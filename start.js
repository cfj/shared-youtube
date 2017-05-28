const mongoose = require('mongoose');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major <= 7 && minor <= 5) {
  console.log('🛑 🌮 🐶 💪 💩\nHey You! \n\t ya you! \n\t\tBuster! \n\tYou\'re on an older version of node that doesn\'t support the latest and greatest things we are learning (Async + Await)! Please go to nodejs.org and download version 7.6 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle an bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!

// Import models
require('./models/User');
require('./models/Event');
require('./models/Video');

const app = require('./app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passportSocketIo = require('passport.socketio');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Start listening on sockets
const { onConnect } = require('./sockets');
io.on('connection', onConnect(io));

io.use(passportSocketIo.authorize({
  key: process.env.KEY,
  secret: process.env.SECRET,
  store: app.get('store'),
  passport: passport,
  cookieParser: cookieParser
}));

// Start our app!
http.listen(process.env.PORT || 7777, function(){
  console.log('listening on *:7777');
});

/*app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});*/