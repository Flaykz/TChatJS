var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8087;

http.listen(port, function(){
    console.log('listening on %d', port);
});

app.use(express.static(__dirname + '/www'));

var usernames = {};
var numUsers = 0;

io.on('connection', function(socket){
    var addedUser = false;
    console.log('a user connected');

    socket.on('disconnect', function(){
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
            console.log(socket.username + ' disconnected');
        }
    });

    socket.on('new message', function(data){
        socket.broadcast.emit('new message', {
            username: data.username,
            message: data.message
        });
        console.log(data.username + ' : ' + data.message);
    });

    socket.on('add user', function(username) {
        socket.username = username;
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });

        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
        console.log(socket.username + ' joined')
    });

    socket.on('start typing', function() {
        socket.broadcast.emit('user typing', socket.username);
    });

    socket.on('stop typing', function() {
        socket.broadcast.emit('user stop typing', socket.username);
    });
});
