//Main game file
"use strict";
var game = game || {};

game.battleBalls = {
  canvas : undefined,
  ctx : undefined,
  arena : undefined,
  playerIDs : [],
  players : {},
  sparks : [],
  booms : [],

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
      me.playerIDs.push(data.id);
    });

    socket.on('player leave', function(data){
      me.playerIDs.splice(me.playerIDs.indexOf(data.id),1);
      delete me.players[data.id];
    });

    socket.on('charge start', function(data){
      me.players[data.id].beginCharge();
    });

    socket.on('charge end', function(data){
      me.players[data.id].endCharge();
    });

    socket.on('phone tilt', function(data) {
      if(me.players[data.id]) {
        me.players[data.id].updateAcceleration(data.yAcc/300, -data.xAcc/300);
      } //my eyes are everywhere --I will gouge your eyes out
    });
    /*me.playerIDs.push('test');
    me.players['test'] = new game.Player(11, 'red', 200, me.canvas.height/2);
    //me.players[12] = new game.Player(12, 'blue', 400, me.canvas.height/2);
    me.players[11].updateAcceleration(0, 0);
    //me.players[12].updateAcceleration(-1/20, 0); 
*/
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
    me.playerIDs.forEach(function(id) {
      var player = me.players[id];
      //Ugly collisions
      me.playerIDs.forEach(function(id2){
        var player2 = me.players[id2];
        if(player2.id !== player.id){
          
          if(game.physicsUtils.circleCollision(player, player2) && !player.colliding(player2)) {
            //get impulse
            var impulse = game.physicsUtils.getImpulse(player, player2, 1.5);
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
    
    me.booms.forEach(function(boom, index, array){
      boom.update(dt);
      var boomc = {
        x : boom.play.x,
        y : boom.play.y,
        velocity : {x:0, y:0},
        mass : boom.pow * 20,
        radius : boom.radius
      };
      //duplicate, make a helper function
      
      me.playerIDs.forEach(function(id){
        var player = me.players[id];
        if(boom.id !== player.id){
          if(game.physicsUtils.circleCollision(player, boomc)) {
            //get impulse
            var impulse = {x:0, y:0};
            impulse = game.physicsUtils.normalize(game.physicsUtils.vecDiff(player, boomc));
            impulse.x *= 15;
            impulse.y *= 15;
            player.applyImpulse(impulse);
            //me.addSparks(player, player2, impulse);
          }
        }
      });

      if(boom.remove) {
        array.splice(index, 1);
      }
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
    me.playerIDs.forEach(function(id) {
      var player = me.players[id];
      player.render(me.ctx);
    });
    me.booms.forEach(function(boom) {
      boom.render(me.ctx);
    });
    me.sparks.forEach(function(spark) {
      spark.render(me.ctx);
    });
  }
}
