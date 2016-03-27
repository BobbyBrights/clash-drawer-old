var socket = io();
var clanInfo = '';

$(function() {
    // On page load update the dimensions.
    updateColumnAndMessagesDimensions();
    // On window resize update the dimensions.
    $(window).resize(function() { updateColumnAndMessagesDimensions(); });

    // Now populate the messages from the Server
    // TODO: Local storage
    populateMessages();
    updateLoggedInCount();
    styleMessages();

    // Now update the Clan Info
    populateClanInfo();

});

// USER
// -----------------------------------

socket.on('user joined', function (data) {
    console.log('received user joined notification');
    $.get('/activeUsers/add', function() {
        updateLoggedInCount();
    });
});

socket.on('user left', function (data) {
    $.get('/activeUsers/remove', function() {
        updateLoggedInCount();
    });
});


// MESSAGES
// -----------------------------------

/**
 * Fill the messages container with messages received from the /msg/all API.
 */
function populateMessages() {
    $.getJSON("/msg/all", function(msgs) {
        var previousMSG = '';
        $.each(msgs, function(i, msg) {
            $('#messages').append(makeMessageTemplate(msg, previousMSG));
            previousMSG = msg;
        });
        //
        updateColumnAndMessagesDimensions();
    });
}

function styleMessages() {
    return;
}

function updateLoggedInCount() {
    $.getJSON("/activeUsers", function(users) {
        $('.active-count').html(users.activeUsers.length);
    });
}



/**
 * Takes a message object and returns a string for the message-item
 * @param  Chat Object *message: returned from API (Mongo Schema)
 */
function makeMessageTemplate(message, previousMessage) {

    if (previousMessage.username !== message.username){
        var messageString = '<li class="message-item last-message-item" id="'+message._id+'">' +
                                '<div class="container">' +
                                    '<span class="message-user col-xs-1">' + message.username.replace(/\s+/g, '') + '</span>' +
                                    '<span class="message-content col-xs-9">' +
                                        '<!--<i class="message-user-status online"></i>-->'+
                                        message.content +
                                    '</span>' +
                                    '<span class="message-date  col-xs-2" data-livestamp="'+message.created+'" title="' + moment(message.created).calendar() + '" ></span>' +
                                '</div>' +
                            '</li>';
    } else {
        $('li#'+previousMessage._id).removeClass('last-message-item');

        var messageString = '<li class="message-item last-message-item" id="'+message._id+'">' +
                                '<div class="container">' +
                                    '<span class="message-content col-xs-9 col-xs-offset-1">' +
                                        '<!--<i class="message-user-status online"></i>-->'+
                                        message.content +
                                    '</span>' +
                                    '<span class="message-date  col-xs-2" data-livestamp="'+message.created+'" title="' + moment(message.created).calendar() + '" ></span>' +
                                '</div>' +
                            '</li>';

    }


    return messageString;
}

/**
 * A new message has been submitted
 */
$('form').submit(function() {
    var data = {msg: $('#m').val(), user: $('#user_local_username').val()};
    socket.emit('chat message', data);
    $('#m').val('');
    return false;
});

/**
 * A new message has been received
 */
socket.on('chat message', function(msg) {
    $('#messages').append(makeMessageTemplate(msg));
    updateColumnAndMessagesDimensions();
});

// CLAN INFORMATION
// -----------------------------------

/**
 * Populate the clan information from members.json,
 * which is pulled from COC API every 12 hours.
 */
function populateClanInfo() {
    $.getJSON("/members.json", function(clan) {
        $('#clan-tag').html(clan.tag);
        $('#clan-members-count').html(clan.members + "/50");
        $('#clan-required-trophies').html(clan.requiredTrophies);
        $('#clan-war-wins').html(clan.warWins);
        $('#clan-war-win-streak').html(clan.warWinStreak);

        $.each(clan.memberList, function(i, member) {
            $('#clan-members-list').append('<span class="label id' + member.league.id + '"><img src="' + member.league.iconUrls.tiny + '">' + member.name);
        });
    });
}


// COLUMN DIMENSIONS
// -----------------------------------

/**
 * Update the dimensions of the messages div, along with other
 * column heights
 */
function updateColumnAndMessagesDimensions() {
    $('#messages').height(($(window).height() - $('nav').height() - $('.message-input').height() - $('.column-header').height() - 20));
    $('.clan-info').height(($(window).height() - $('nav').height() - $('.column-header').height() - 1));
    $('.column-1, .column-3').height(($(window).height() - $('nav').height() - $('.column-header').height() + $('.message-input').height() - 13));
    scrollToBottomOfMessages();
}

/**
 * Scroll to the bottom of the messages div.
 */
function scrollToBottomOfMessages() {
    $('#messages').scrollTop($('#messages').prop("scrollHeight"));
}
