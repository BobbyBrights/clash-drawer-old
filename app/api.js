var mongoose = require('mongoose');
var Chat = require('./models/chat.js');
var _ = require('underscore');

var activeUsers = [];

module.exports = function(app, passport) {

    app.get('/msg/all', function(req, res) {
        Chat.find(function(err, msgs) {
            res.json(msgs);
        });
    });

    app.get('/activeUser', function(req, res) {
        if (req.user === undefined){
            res.json({});
        } else {
            res.json({
                user: req.user
            });
        }
    });

    app.get('/activeUsers', function(req, res) {
        res.json({activeUsers: _.uniq(activeUsers)});
    });

    app.get('/activeUsers/add', function(req, res) {
        activeUsers.push(req.user.username);
        res.json({activeUsers: _.uniq(activeUsers)});
    });

    app.get('/activeUsers/remove', function(req, res) {
        if(activeUsers.indexOf(req.user.username) > 0){
            activeUsers.splice(activeUsers.indexOf(req.user.username), 1);
        }
    });



};

exports.activeUsers = activeUsers;
