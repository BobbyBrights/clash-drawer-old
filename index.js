// IMPORTS
// -----------------------------------
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

// CONFIGS
// -----------------------------------

// Look for static files in /public
app.use(express.static(__dirname + '/public'));

mongoose.connect("mongodb://127.0.0.1:27017/clash-drawer");

// SCHEMAS
// -----------------------------------

// Chat
var ChatSchema = mongoose.Schema({
    created: Date,
    content: String,
    username: String
});
var Chat = mongoose.model('Chat', ChatSchema);

// Allow CORS (cross origin resource sharing)
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


// ROUTES
// -----------------------------------

// Root directory
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

// API: Get all mesages in JSON format
app.get('/msg/all', function(req, res) {
    Chat.find(function(err, msgs) {
        res.json(msgs);
    });
});



// a conncetion has been established
io.on('connection', function(socket) {

    console.log('a user connected');



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

        io.emit('chat message', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
