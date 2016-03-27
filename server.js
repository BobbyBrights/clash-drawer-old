// IMPORTS
// -----------------------------------
var express       = require('express');
var app           = express();
var port          = process.env.PORT || 8080;
var http          = require('http').Server(app);
var io            = require('socket.io')(http);
var mongoose      = require('mongoose');
var passport      = require('passport');
var flash         = require('connect-flash');
var morgan        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var session       = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore    = require('connect-mongo')(session);

// MODELS
// -----------------------------------
var User          = require('./app/models/user');
var Chat          = require('./app/models/chat.js');

// CONFIGS
// -----------------------------------

var configDB      = require('./config/database.js');


    // Mongoose
    mongoose.connect(configDB.url); // connect to our database

    // Logging
    // app.use(morgan('tiny')); // log every request to the console

    // Parsing
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Cookies and sessions
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(session({
        secret: 'keyboard cat',
        name: 'express.sid',
        store: new MongoStore({mongooseConnection: mongoose.connection }),
        resave: false,
        saveUnitialized: false
    }));
    app.use(function setSessionDuration(req, res, next) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
      //                           ms     s    m    h   d -> 1 week.
      next();
    })

    // View templating engine
    app.set('view engine', 'ejs'); // set up ejs for templating

    // Look for static files in /public
    app.use(express.static(__dirname + '/public'));

    // Erroring messages
    app.use(flash()); // use connect-flash for flash messages stored in session

    // Passport (auth)
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions


// ROUTES
// -----------------------------------

require('./app/routes.js')(app, passport);
require('./app/api.js')(app, passport);

// SOCKETS
// -----------------------------------
//
// a conncection has been established
//

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.emit('user joined');

    // a user has disconnected
    socket.on('disconnect', function() {
        socket.emit('user left');
        console.log('user disconnected');
    });

    // New Chat Message Received
    socket.on('chat message', function(data) {

        console.log(data);
        var chat = {
            created: new Date(),
            content: data.msg,
            username: data.user
        };

        new Chat(chat).save();

        io.emit('chat message', chat);
    });
});


// SPIN THE SERVERS!!!!
// -----------------------------------
http.listen(port, function() {
    console.log('listening on *:' + port);
});
