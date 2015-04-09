"use strict";
var game = game || {};

game.socketHandlers = {
  init : function(app) {
    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    var room = "";
    var password = "";
    var connectData = {};
    /*socket.emit('host connect', connectData);
    socket.on('host establish', function(data){
      console.log(data.password);
    });*/
    //Set up socket events --Ha Andrew don't look at this --You can't stop me
    socket.on('player join', function(data){
      var x = app.canvas.width/2, y = app.canvas.height/2;
      app.players[data.id] = new game.Player(data.id, data.color, x, y);
      app.playerIDs.push(data.id);
      console.log(app.playerIDs);
    });

    socket.on('player leave', function(data){
      if(app.players[data.id])
        app.playerIDs.splice(app.playerIDs.indexOf(data.id),1);
      delete app.players[data.id];
    });

    socket.on('player ready', function(data){
      if(app.players[data.id])
        app.players[data.id].ready = true;
    });

    socket.on('charge start', function(data){
      app.players[data.id].beginCharge();
    });

    socket.on('charge end', function(data){
      app.players[data.id].endCharge();
    });

    socket.on('phone tilt', function(data) {
      if(app.players[data.id])
        app.players[data.id].updateAcceleration(data.yAcc/300, -data.xAcc/300);
      //my eyes are everywhere --I will gouge your eyes out
    });
    app.loop();
  }
}