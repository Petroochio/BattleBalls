var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var users = {};
var rooms = {};
var players = 0;
var port = process.env.PORT || process.env.NODE_PORT || 3000;

var generateRoomKey = function(){
  var pw = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var string_length = 4;
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    pw += chars.substring(rnum,rnum+1);
  }
  return pw;
}

app.use('/assets', express.static(path.resolve(__dirname) + '../../assets'));
app.get('/', function(req, res){
  //the html string being sent
  var md = new MobileDetect(req.headers['user-agent']);
  var filepath = path.resolve(__dirname + '/../assets/views/index.html');
  if(md.mobile() != null) {
    filepath = path.resolve(__dirname + '/../assets/views/mobile_index.html');
  }
  res.sendFile(filepath);
});
// **** ACTIONS DONE BY SERVER HAVE HIGHER PRIORITY AND INIT BEFORE CLIENT ACTIONS

// Setup socket.io
// listen to connection
io.on('connection', function(socket){
  //broadcast that a user has connected
  //pass an object containing user informatiojn?
  //Create a new room to host the game
  socket.on('hostConnect', function(socket){
    //generate a room key
    var rm = ""
    //if the room key already exists get a new one
    while(rm === "" || rooms[rm] !== undefined){
      rm = generateRoomKey();
    }
    //create a room object to hold server values
    rooms[rm] = {
      players: 0,
      users: {}
    };
    var data = {room: rm};
    //join the room
    socket.join(rm);
    io.to(socket.id).emit('hostEstablish', data);
  });
  // handle disconnects
  socket.on('disconnect', function(){//ROOM CODE?
    io.emit('player leave', {id: socket.id});
    
    if(users[socket.id]){
      delete users[socket.id];
      players--;
    }
  });
/*
  socket.on('host connect', function(data){

  });
*/
  socket.on('state change', function(data){//ROOM CODE NEEDED HERE
    io.emit('state change', data);
  });

  socket.on('player join', function(data){//ROOM CODE NEEDED HERE
    if(data.id === -1 && players < 15){
      players++;
      data.id = socket.id;
      users[socket.id] = socket;
      io.to(socket.id).emit('player connect', data);
      io.emit('player join', data);
    } else {
      socket.disconnect();
    }
  });

  socket.on('phone tilt', function(data){//ROOM CODE
    io.emit('phone tilt', data);
  });

  socket.on('player ready', function(data){//ROOM CODE
    io.emit('player ready', data);
  });

  socket.on('charge start', function(data){//ROOM CODE
      console.log(data);
    io.emit('charge start', data);
  });

  socket.on('charge end', function(data){//ROOM CODE
    io.emit('charge end', data);
  });

});



http.listen(port, function(){
  console.log('listening on *:3000');
});