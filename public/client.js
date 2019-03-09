$(function () {
    const socket = io();
    // check cookies for past user
    let color = getCookies("color");
    socket.emit('check color', color);
    let nick = getCookies("username");
    socket.emit('set cookie nick', nick);

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading

        // check input for nick change or color change
        let message = $('#messageInput').val();
        if (message.includes("/nick ")) {
            socket.emit('change name', message);
        } else if (message.includes("/nickcolor ")) {
            socket.emit("change color", message);
        } else {
            socket.emit('chat message', message);
        }
        $('#messageInput').val('');
        return false;
    });

    // send a chat message
    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').html(msg));

    });

    // update identifier at top of page on name change
    socket.on('update identifier', function (name) {
        $('#identifier').text("You are " + name);

        // update username in cookies
        setCookies("username", name);
    });

    socket.on('update nick', function (list) {
        $('#user-list').empty();
        $.each(list, function (i) {
            $('#user-list').append($('<li>' + list[i] + '</li>'));
        });
    });

    // set username in identifier
    socket.on('set username', function (name) {
        if(nick !== ""){
            $('#identifier').append(" " + nick);
        }else {
            $('#identifier').append(" " + name);
            // set username in cookies
            setCookies("username", name);
        }

    });

    // show user list
    socket.on('show users', function (users) {
        $('#user-list').empty();
        $.each(users, function (i) {
            $('#user-list').append($('<li>' + users[i] + '</li>'));
        });
    });

    // remove user from list
    socket.on('remove user', function (user) {
        $('#user-list li').filter(function () {
            return $.text([this]) === user;
        }).remove();
    });

    // get past messages for new user
    socket.on('get messages', function (chat) {
        $.each(chat, function (i) {
            $('#messages').append($('<li>' + chat[i] + '</li>'));
        });
    });

    // set cookies on color change
    socket.on('set color cookie', function (rgb) {
       setCookies("color", rgb);
    });

    // set cookies
    function setCookies(type, value) {
        // set expiry date for 100 days from current date
        let d = new Date();
        d.setTime(d.getTime() + (100*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = type+"=" + value + ";" + expires + ";path=/";
    }

    // get cookies from past sessions
    function getCookies(type) {
        let name = type+"=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});
