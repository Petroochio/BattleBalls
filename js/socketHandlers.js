"use strict";
var game = game || {};

game.socketHandlers = {
  init : function(app) {
    /*me.canvas = document.querySelector('#area');
    me.ctx = me.canvas.getContext('2d');
    me.ctx.lineWidth = 5;
    me.arena = game.createArena('white', me.canvas.height/2-10, me.canvas.width/2, me.canvas.height/2);*/
    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});
    var room = "";
    var password = "";
    var connectData = {};
    socket.emit('host connect', connectData);
    socket.on('host establish', function(data){
      console.log(data.password);
    });
    //Set up socket events --Ha Andrew don't look at this --You can't stop me
    socket.on('player join', function(data){
      var x = app.canvas.width/2, y = app.canvas.height/2;
      app.players[data.id] = new game.Player(data.id, data.color, x, y);
      app.playerIDs.push(data.id);
    });

    socket.on('player leave', function(data){
      app.playerIDs.splice(app.playerIDs.indexOf(data.id),1);
      delete app.players[data.id];
    });

    socket.on('charge start', function(data){
      app.players[data.id].beginCharge();
    });

    socket.on('charge end', function(data){
      app.players[data.id].endCharge();
    });

    socket.on('phone tilt', function(data) {
      if(app.players[data.id]) {
        app.players[data.id].updateAcceleration(data.yAcc/300, -data.xAcc/300);
      } //my eyes are everywhere --I will gouge your eyes out
    });
    app.loop();
  }
}