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


// CONFIGS
// -----------------------------------

var configDB = require('./config/database.js');
require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// Look for static files in /public
app.use(express.static(__dirname + '/public'));

// Mongoose
mongoose.connect(configDB.url); // connect to our database

// Variables
// -----------------------------------
var numUsers = 0;

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

    var addedUser = false;

    socket.on('add user', function(user) {
        if(addedUser) return;

        socket.user = user;
        ++numUsers;

        addedUser = true;
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
    socket.on('chat message', function(msg) {
        var chat = {
            created: new Date(),
            content: msg,
            username: "gareth"
        };

        new Chat(chat).save();

        io.emit('chat message', chat);
    });
});

http.listen(port, function() {
    console.log('listening on *:' + port);
});
