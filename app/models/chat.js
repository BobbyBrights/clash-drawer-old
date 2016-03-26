var mongoose = require('mongoose');

var ChatSchema = mongoose.Schema({
    created: Date,
    content: String,
    username: String
});

module.exports = mongoose.model('Chat', ChatSchema);
