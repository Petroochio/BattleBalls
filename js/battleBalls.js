//Main game file
"use strict";
var game = game || {};

game.battleBalls = {
  canvas : undefined,
  ctx : undefined,
  arena : undefined,
  players : [],
  sparks : [],

  init : function(){
    var me = this;

    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;

    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});

    me.canvas = document.querySelector('#area');
    me.ctx = me.canvas.getContext('2d');
    me.ctx.lineWidth = 5;
    me.arena = game.createArena('white', /*230*/me.canvas.height/2-10, me.canvas.width/2, me.canvas.height/2);

    //Set up socket events --Ha Andrew don't look at this --You can't stop me
    socket.on('player join', function(data){
      var x = me.canvas.width/2, y = me.canvas.height/2;
      me.players[data.id] = new game.Player(data.id, data.color, x, y);
    });

    socket.on('phone tilt', function(data) {
      if(me.players[data.id]) {
        me.players[data.id].updateAcceleration(data.yAcc/300, data.xAcc/300);
      } //my eyes are everywhere
    });

    me.players[11] = new game.Player(11, 'red', 200, me.canvas.height/2);
    me.players[12] = new game.Player(12, 'blue', 400, me.canvas.height/2);
    me.players[11].updateAcceleration(1/20, 0);
    me.players[12].updateAcceleration(-1/20, 0);

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

            //me.addSparks(player, player2, impulse);
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

    this.sparks.forEach(function(spark, index, array){
      spark.update(dt);
      if(spark.remove) {
        array.splice(index, 1);
      }
    });
  },

  addSparks : function(c1, c2, impulse) {
    var line = game.physicsUtils.getPerp(game.physicsUtils.getSlope(c1, c2));
    var x = c1.x - (c1.x - c2.x)/2;
    var y = c1.y - (c1.y - c2.y)/2;

    this.sparks.push(new game.Spark(x, y, line.x/5, line.y/5));
    this.sparks.push(new game.Spark(x, y, -line.x/5, -line.y/5));
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
    me.sparks.forEach(function(spark) {
      spark.render(me.ctx);
    });
  }
}
