$(function () {
    const socket = io();

    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading

        let message = $('#messageInput').val();
        if(message.includes("/nick ")){
            socket.emit('change name', message);
        } else if(message.includes("/nickcolor ")){
            socket.emit("change color", message);
        } else {
            socket.emit('chat message', message);
        }
        $('#messageInput').val('');
        return false;
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').html(msg));

        //updateScrollbar();
    });

    socket.on('update identifier', function(name){
        $('#identifier').text("You are "+name);
    });

    socket.on('update nick', function(list){
        $('#user-list').empty();
        $.each(list, function (i) {
            $('#user-list').append($('<li>'+list[i]+'</li>'));
        });
    });

    socket.on('update color', function(color){
        $('.nick-color').css('color', color)
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
        $('#user-list li').filter(function() { return $.text([this]) === user; }).remove();
    });

    socket.on('get messages', function (chat) {
        $.each(chat, function (i) {
            $('#messages').append($('<li>'+chat[i]+'</li>'));
        });
    })
/*
    function updateScrollbar(){
        $('#chat-box').scrollTop = $('#chat-box').scrollHeight;
    }*/
});
