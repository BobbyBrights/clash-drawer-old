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

    app.get('/refresh', function(req, res) {
        var request = require('request');
        var jsonfile = require('jsonfile')

        var apikey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjJiOTA0MjZlLTFlMjAtNDBlNy04MDhjLWVmZDNhMWI4MDdhZiIsImlhdCI6MTQ1OTEwMjAzOSwic3ViIjoiZGV2ZWxvcGVyLzU5M2YzOGY1LWU5MGYtNDMyNi0zNzZkLWJkZDQwZWRlNTlkYyIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjgxLjEzNS40Mi4zIiwiNDYuMTAxLjMwLjIyNyJdLCJ0eXBlIjoiY2xpZW50In1dfQ.RUWR_7_1xhLp3hyE7CEp-WQGK5XuC8K4kPAhcWjKYX3uVQzOb-djZCrPOXtKf1TCQAUzc5LKV0zGmpwA3k9DGA';
        var file = 'public/members.json'

        var options = {
          url: 'https://api.clashofclans.com/v1/clans/%238R80QQVP',
          headers: {
            'Authorization': 'Bearer ' + apikey,
            'Accept': 'application/json'
          }
        };

        request(options, function (error, response, body) {
            jsonfile.writeFile(file, JSON.parse(body), function (err) {
              console.error(err)
            })
            res.json(JSON.parse(body));
        })

    });

};

exports.activeUsers = activeUsers;
