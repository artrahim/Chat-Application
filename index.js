const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path');

let firstNames = ["Aloof", "Auspicious", "Boorish", "Cagey", "Caustic", "Dapper",
"Erratic", "Ethereal", "Guileless", "Heady", "Insidious", "Obtuse", "Petulant",
"Placid", "Plucky", "Sordid", "Tenacious", "Vivacious", "Wistful"];

let lastNames = ["Axolotl", "Salamander", "Frog", "Turtle", "Buffalo", "Lizard",
"Condor", "Cormorant", "Capybara", "Sheep", "Quokka", "Platypus", "Sugar Glider",
"Wombat", "Koala", "Sea Lion", "Kangaroo", "Kakapo", "Praying Mantis", "Camel",
"Nutria", "Antelope", "Tapir", "Echidna", "Hedgehog", "Pangolin", "Opossum"];

let currentUsers = [];

let chatHistory = [];

let username = "";

let nickcolor = "#000";

let duplicatedUsers = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
    // give connected user past messages
    socket.emit('get messages', chatHistory);

    // generate random username
    username = generateName();

    // set initial username
    socket.emit('set username', username);

    // update nick in case returning user
    socket.on('set cookie nick', function (nick) {
        // check if cookie has a username set
        if(nick !== ""){
            socket.username = nick;
        } else {
            socket.username = username;
        }

        // only update user list if user is not already in the chat
        if(!currentUsers.includes(socket.username)){
            currentUsers.push(socket.username);
        }
        // add to duplicated list to check for multiple tabs
        duplicatedUsers.push(socket.username);
        // show user list to users
        io.emit('show users', currentUsers);
    });

    // check if a cookie has set a color
    socket.on('check color', function (color) {
        if(color !== ""){
            socket.nickcolor = color;
        }
    });

    // send a chat message
    socket.on('chat message', function(msg){
        //check if message is empty
        if(msg.trim() !== ""){
            //calculate time message is sent
            let messageTime = calculateTime();

            // create message for others
            let message = messageTime + "  <span style=color:"+socket.nickcolor+">" + socket.username + ":</span> " + msg;
            // create message for sender
            let messagebold = messageTime + "  <b><span style=color:"+socket.nickcolor+">" + socket.username + ":</span> " + msg+'</b>';

            chatHistory.push(message);

            //send for sender
            socket.emit('chat message', messagebold);
            //send for others
            socket.broadcast.emit('chat message', message);
        }
    });

    // change a users nick to their preferred name
    socket.on('change name', function (msg) {
        // get new nick from input
        let nick = msg.substring(msg.indexOf("/nick")+6);

        //check if nick is too long
        if(nick.length > 20){
            let error = "<span class = error-text>Please enter a name under 20 characters</span>";
            socket.emit('chat message', error);
        } else if(currentUsers.includes(nick)){
            let error = "<span class = error-text>Please select a name that has not yet been taken</span>";
            socket.emit('chat message', error);
        } else{
            // replace old nick from userlist
            currentUsers.splice(currentUsers.indexOf(socket.username), 1, nick);

            // update new name
            socket.username = nick;

            // update identifier
            socket.emit('update identifier', nick);

            // update html list
            io.emit('update nick', currentUsers);

        }

    });

    // change the users nick color to their chosen color
    socket.on('change color', function (msg) {
        //get color from input
        let rgbCol = msg.substring(msg.indexOf("/nickcolor")+11,msg.indexOf("/nickcolor")+18).trim();

        //check if color is a valid rgb value
        let isRGB  = /(^[0-9A-F]{6}$)/i.test(rgbCol);
        if(!isRGB || rgbCol.length !== 6){
            let error = "<span class = error-text>Please enter a valid RGB value in the format RRGGBB</span>";
            socket.emit('chat message', error);
        }

        // assign the color to the socket
        rgbCol = "#"+rgbCol;
        socket.nickcolor = rgbCol;

        // set color in cookie
        socket.emit('set color cookie', rgbCol);
    });

    socket.on('disconnect', function () {
        // check if tabs are still open
        if(userCountPop(socket.username) <= 0){
            // update user list
            currentUsers.splice(currentUsers.indexOf(socket.username), 1);

            // update html
            io.emit('remove user', socket.username);
        }
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});


// find the current local time
function calculateTime(){
    let time;
    const date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();

    if(minute < 10){
        minute = "0" + minute;
    }

    if(hour > 12) {
        hour = hour - 12;
        time = hour + ":" + minute + "pm";
    } else {
        time = hour + ":" + minute + "am";
    }

    return time;
}

// generate a random username
function generateName(){
    let name;

    // repeat generation until it creates a name not currently used
    do {
        let randFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
        let randLast = lastNames[Math.floor(Math.random() * lastNames.length)];

        name = randFirst+" "+randLast;
    } while(currentUsers.includes(name));

    return name;
}

// remove a user and show updated count of name in list
function userCountPop(name){
    let count = 0;
    duplicatedUsers.splice(duplicatedUsers.indexOf(name), 1);
    duplicatedUsers.forEach(function(currentName){
        if(currentName === name)
            count++;
    });

    return count;
}