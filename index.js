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

//TODO: bold user messages, allow changing usernames, allow changing colour of username, implement cookies, add scrollbar, align text to bottom
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

            let message = messageTime + "  " + socket.username + ": " + msg;

            chatHistory.push(message);

            io.emit('chat message', message);
        }
    });


    socket.on('disconnect', function () {
        currentUsers.splice(currentUsers.indexOf(socket.username));

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