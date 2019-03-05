$(function () {
    const socket = io();

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#messageInput').val());
        $('#messageInput').val('');
        return false;
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('change name', function(name){

    });

    socket.on('set username', function(name){
        $('#identifier').append(" "+name);
    });

    socket.on('add user', function (users) {
        $('#user-list').empty();
        $.each(users, function (i) {
            $('#user-list').append($('<li>'+users[i]+'</li>'));
        });
    });

    socket.on('remove user', function (user) {
        $('li:contains('+user+')').remove();
    });

    socket.on('get messages', function (chat) {
        $.each(chat, function (i) {
            $('#messages').append($('<li>'+chat[i]+'</li>'));
        });
    })

});