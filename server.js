// IMPORTS
// -----------------------------------
var express      = require('express');
var app          = express();
var port         = process.env.PORT || 8080;
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(session);


// CONFIGS
// -----------------------------------

var configDB = require('./config/database.js');

var User = require('./app/models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//require('./config/passport')(passport); // pass passport for configuration
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(session({
    secret: 'keyboard cat',
    store: new MongoStore({mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Look for static files in /public
app.use(express.static(__dirname + '/public'));

// Mongoose
mongoose.connect(configDB.url); // connect to our database

// Variables
// -----------------------------------
var numUsers = 0;
var Chat = require('./app/models/chat.js');


// ROUTES
// -----------------------------------
//

app.get('/active_chatters', function(req, res) {
    res.json({numUsers: numUsers});
});

require('./app/routes.js')(app, passport);
require('./app/api.js')(app, passport);

// SOCKETS
// -----------------------------------
//
// a conncetion has been established
io.on('connection', function(socket) {
    console.log('a user connected');

    socket.on('add user', function(user) {

        socket.emit('user joined', {
            user: socket.user,
            numUsers: numUsers
        });
    });

    // a user has disconnected
    socket.on('disconnect', function() {
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

http.listen(port, function() {
    console.log('listening on *:' + port);
});
