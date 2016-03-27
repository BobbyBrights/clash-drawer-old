var mongoose = require('mongoose');
var Chat = require('./models/chat.js');


var activeUsers = [];

module.exports = function(app, passport) {

    app.get('/msg/all', function(req, res) {
        Chat.find(function(err, msgs) {
            res.json(msgs);
        });
    });

    app.get('activeUsers/add', function(req, res) {
        if(activeUsers.indexOf(req.user.username) > 0){
            activeUsers.push(req.user.username);
        }
        return;
    });

    app.get('activeUsers/remove', function(req, res) {
        if(activeUsers.indexOf(req.user.username) > 0){
            activeUsers.splice(activeUsers.indexOf(req.user.username), 1);
        }
        return;
    });


};
