$(function() {
    var socket = io();

    var FADE_TIME = 150; //ms
    var TYPING_TIMER_LENGTH = 400; //ms

    var $window = $(window);
    var $tchat = $('#tchat');
    var $tchatArea = $('#tchatArea');
    var $showMessage = $('#showMessage');
    var $inputMessage = $('#inputMessage');
    var $login = $('#login');
    var $titleUsername = $('#titleUsername');
    var $inputUsername = $('#inputUsername');

    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $inputUsername.focus();
    var numUsers = 0;

    // function
    function log(message) {
        $showMessage.append($('<li>').text(message));
    }

    function sendMessage() {
        var message = $inputMessage.val();
        message = cleanInput(message);
        if (message && connected) {
            $inputMessage.val('');
            log(username + ' : ' + message);
            socket.emit('new message', {
                username: username,
                message: message
            });
        }
    }

    function setUsername() {
        username = cleanInput($inputUsername.val().trim());
        if (username) {
            $login.hide();
            $tchatArea.show();
            $currentInput = $inputMessage.focus();
            socket.emit('add user', username);
        }
    }

    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    //keyboard events

    $window.keydown(function (event) {
        if (!(event.ctrlkey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        if (event.which === 13) {
            if (username) {
                sendMessage();
            }
            else {
                setUsername();
            }
        }
    });

    //click events
    $login.click(function() {
        $currentInput.focus();
    })

    $inputMessage.click(function () {
        $inputMessage.focus();
    })

    $inputMessage.on('input', function() {
        socket.emit('start typing');
    });

    //socket event

    socket.on('login', function(data) {
        connected = true;
        numUsers = data.numUsers;
        log('Welcome on TchatJS');
    });
    
    socket.on('new message', function(data){
        log(data.username + ' : ' + data.message);
    });

    socket.on('user joined', function(data) {
        numUsers = data.numUsers;
        log(data.username + ' joined');
    });

    socket.on('user left', function(data) {
        log(data.username + ' disconnected');
        numUsers = data.numUsers;
    });

    socket.on('user typing', function(username) {
        log(username + ' begin typing...');
    });

    socket.on('user stop typing', function(username) {
        log(username + ' stop typing !');
    });
});
