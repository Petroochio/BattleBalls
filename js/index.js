var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var MobileDetect = require('mobile-detect');
var users = {};
var players = 0;

app.use('/js', express.static(path.resolve(__dirname)));
app.get('/', function(req, res){
	//the html string being sent
	var md = new MobileDetect(req.headers['user-agent']);
	var filepath = path.resolve(__dirname + '/../index.html');
	if(md.mobile() != null) {
		filepath = path.resolve(__dirname + '/../mobile_index.html');
	}
	res.sendFile(filepath);
});
// **** ACTIONS DONE BY SERVER HAVE HIGHER PRIORITY AND INIT BEFORE CLIENT ACTIONS

// Setup socket.io
// listen to connection
io.on('connection', function(socket){
	//broadcast that a user has connected
	//pass an object containing user informatiojn?
	// handle disconnects
	socket.on('disconnect', function(){
		io.emit('player leave', {id: socket.id});
    console.log('user disconnected');
    if(users[socket.id]){
      delete users[socket.id];
      players--;
    }
	});
});

io.on('connection', function(socket){
  socket.on('player join', function(data){
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

  socket.on('phone tilt', function(data){
    io.emit('phone tilt', data);
  });

  socket.on('charge start', function(data){
    io.emit('charge start', data);
  });

  socket.on('charge end', function(data){
    io.emit('charge end', data);
  });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
