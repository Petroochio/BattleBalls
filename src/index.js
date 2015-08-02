var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var mongoose = require('mongoose'); 
var users = {};
var rooms = {};
var port = process.env.PORT || process.env.NODE_PORT || 3000;
//models
var models = require('./models');
var Account = models.Account;
//For creating new accounts
var intialClassList = {
  newbie: true,
  ghost: true,
  speed: true,
  matadore: true
}

var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/BirdMaker";

var db = mongoose.connect(dbURL, function(err) {
    if(err) {
        console.log("Could not connect to database");
        throw err;
    }
});
//Function for generating a random room key
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
  socket.on('hostConnect', function(){
    //generate a room key
    var rm = ""
    //if the room key already exists get a new one
    while(rm === "" || rooms[rm] !== undefined){
      rm = generateRoomKey();
    }
    //create a room object to hold server values
    rooms[rm] = {
      players: 0
    };
    var data = {room: rm};
    console.log(rm);
    //join the room
    socket.join(rm);
    io.to(socket.id).emit('hostEstablish', data);
  });
  // handle disconnects
  socket.on('disconnect', function(){//ROOM CODE?
    io.emit('player leave', {id: socket.id});
    
    if(users[socket.id]){
      rooms[users[socket.id].room].players--;
      delete users[socket.id];
    }
  });
/*
  socket.on('host connect', function(data){

  });
*/
  socket.on('state change', function(data){//ROOM CODE NEEDED HERE
    io.to(data.room).emit('state change', data);
  });

  socket.on('player join', function(data){//ROOM CODE NEEDED HERE
    if(rooms[data.room] === undefined){
      console.log("no room" + data.room);
      io.to(socket.id).emit('player connect', data);
      return;
    }

    if(data.id === -1 && rooms[data.room].players < 8){
      data.id = socket.id;
      rooms[data.room].players++;
      users[socket.id] = {
        socket: socket,
        room: data.room
      };
      io.to(socket.id).emit('player connect', data);
      socket.join(data.room);
      io.to(data.room).emit('player join', data);
    } else {
      console.log("room full " + data.room);
      io.to(socket.id).emit('player connect', data);
      return;
    }
  });

  socket.on('phone tilt', function(data){//ROOM CODE
    io.to(data.room).emit('phone tilt', data);
  });
  //////////////////
  //ACCOUNT EVENTS
  //////////////////
  //Login event for the player
  socket.on('account login', function(data){
    console.log(data);
    var username = data.name;
    var password = data.pass;

    if(!username || !password) {
        //return res.status(400).json({error: "RAWR! All fields are required"});
    }
    Account.AccountModel.authenticate(username, password, function(err, account) {
        if(err || !account) {
            //return res.status(401).json({error: "Wrong username or password"});
            io.to(socket.id).emit('login err', {result: 'Login Fail, Bad username or password'});
            return false;
        }
        var reqData = {};
        reqData.account = account.toAPI();
        io.to(socket.id).emit('login success', reqData);
    });
  });
  //Event for creating account
  socket.on('account create', function(data){
    console.log(data);
    if(!data.name || !data.pass || !data.pass2) {
        return false;//res.status(400).json({error: "RAWR! All fields are required"});
    }

    if(data.pass !== data.pass2) {
        return false;//res.status(400).json({error: "RAWR! Passwords do not match"});
    }
    console.log('good stuff');
    Account.AccountModel.generateHash(data.pass, function(salt, hash) {

      var accountData = {
        username: data.name,
        salt: salt,
        password: hash,
        losses: 0,
        wins: 0,
        classes: intialClassList
      };
      
      var newAccount = new Account.AccountModel(accountData);
      var reqData = {};
      newAccount.save(function(err) {
        if(err) {
          console.log(err);
          return io.to(socket.id).emit('sign-up error', {result: err});//res.status(400).json({error:'An error occurred'}); 
        }

        reqData.account = newAccount.toAPI();
              
        io.to(socket.id).emit('login success', reqData);
      });
    });
  });
  //////////////////
  //GAME EVENTS
  //////////////////
  //Ready event to start the game
  socket.on('player ready', function(data){//ROOM CODE
    io.to(data.room).emit('player ready', data);
  });
  //Touch event for starting ability charges
  socket.on('charge start', function(data){//ROOM CODE
      console.log(data);
    io.to(data.room).emit('charge start', data);
  });

  socket.on('charge end', function(data){//ROOM CODE
    io.to(data.room).emit('charge end', data);
  });

  socket.on('select class', function(data){//ROOM CODE
    io.to(data.room).emit('select class', data);
  });
});

http.listen(port, function(){
  console.log('listening on *:3000');
});