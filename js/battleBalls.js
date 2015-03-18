//Main game file
"use strict";
var game = game || {};

game.battleBalls = {
  canvas : undefined,
  ctx : undefined,
  arena : undefined,
  players : [],

  init : function(){
    var me = game.battleBalls;
    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;

    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});

    me.canvas = document.querySelector('#area');
    me.ctx = me.canvas.getContext('2d');
    me.ctx.lineWidth = 5;
    me.arena = game.createArena('white', 240, me.canvas.width/2, me.canvas.height/2);

    //Set up socket events --Ha Andrew don't look at this
    socket.on('player join', function(data){
      var x = me.canvas.width/2, y = me.canvas.height/2;
      me.players[data.id] = game.createPlayer(data.id, data.color, x, y);
    });

    socket.on('phone tilt', function(data) {
      if(me.players[data.id]) {
        me.players[data.id].updateAcceleration(data.xAcc/300, data.yAcc/300);
      }
    });
    console.log(me);
    me.loop();
  },

  loop : function() {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
    this.render();
  },

  update : function() {
    var dt = 0;
    var me = this;
    this.players.forEach(function(player) {
      //Ugly collisions
      me.players.forEach(function(player2){
        if(player2.id !== player.id){
          
          if(game.physicsUtils.circleCollision(player, player2) && !player.colliding(player2)) {
            //get impule
            var impulse = game.physicsUtils.getImpulse(player, player2);
            player.applyImpulse(impulse);
            impulse.x = impulse.x * -1;
            impulse.y = impulse.y * -1;
            player2.applyImpulse(impulse);
            player2.collisions.push(player);
            player.collisions.push(player2);
          }
        }
      });
      //Bad code for resetting player if they leave the arena
      if(!me.arena.inBounds(player)) {
        player.x = me.canvas.width/2;
        player.y = me.canvas.width/2;
      }
      player.update(dt);
    });
  },

  render : function() {
    var me = this;
    me.ctx.save();
    me.ctx.fillStyle = 'black';
    me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
    me.ctx.restore();
    me.arena.render(me.ctx);
    me.players.forEach(function(player) {
      player.render(me.ctx);
    });
  }
}
