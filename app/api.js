var mongoose = require('mongoose');
var Chat = require('./models/chat.js');


module.exports = function(app, passport) {

    app.get('/msg/all', function(req, res) {
        Chat.find(function(err, msgs) {
            res.json(msgs);
        });
    });


};
