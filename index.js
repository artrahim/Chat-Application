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

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

//TODO: allow changing colour of username, implement cookies, add scrollbar, align text to bottom, make sure changed nick is unique
io.on('connection', function(socket){

    // give connected user past messages
    socket.emit('get messages', chatHistory);

    // generate random username
    username = generateName();

    // set initial username
    socket.emit('set username', username);
    socket.username = username;

    // add username to list of users
    currentUsers.push(username);

    // show updated list of users
    io.emit('add user', currentUsers);

    socket.on('chat message', function(msg){
        //check if message is empty
        if(msg.trim() !== ""){
            //calculate time message is sent
            let messageTime = calculateTime();

            // create message for others
            let message = messageTime + "  <span class=nick-color>" + socket.username + ":</span> " + msg;
            // create message for sender
            let messagebold = messageTime + "  <b><span class=nick-color>" + socket.username + ":</span> " + msg+'</b>';

            chatHistory.push(message);

            //send for sender
            socket.emit('chat message', messagebold);
            //send for others
            socket.broadcast.emit('chat message', message);
        }
    });

    socket.on('change name', function (msg) {
        // get new nick from input
        let nick = msg.substring(msg.indexOf("/nick")+6);

        // replace old nick from userlist
        currentUsers.splice(currentUsers.indexOf(socket.username), 1, nick);

        // update new name
        socket.username = nick;

        // update identifier
        socket.emit('update identifier', nick);

        // update html list
        io.emit('update nick', currentUsers);

    });

    socket.on('change color', function (msg) {
        //get color from input
        let rgbCol = msg.substring(msg.indexOf("/nickcolor")+11,msg.indexOf("/nickcolor")+18).trim();
        console.log(rgbCol);
        let isOk  = /(^[0-9A-F]{6}$)/i.test(rgbCol);
        if(!isOk || rgbCol.length !== 6){
            let error = "<span class = error-text>Please enter a valid RGB value in the format RRGGBB</span>";
            socket.emit('chat message', error);
        }

        rgbCol = "#"+rgbCol;
        socket.emit('update color', rgbCol);
    });

    socket.on('disconnect', function () {
        // update user list
        currentUsers.splice(currentUsers.indexOf(socket.username), 1);

        // update html
        io.emit('remove user', socket.username);
    });
});


http.listen(3000, function(){
    console.log('listening on *:3000');
});

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
