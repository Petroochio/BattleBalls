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
  state : 'GAME',

  init : function(){
    var me = this;

    // create new instance of socket.io
    var num = Math.floor(Math.random()*10);
    var name ='user'+num;

    //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
    //var socket = io.connect( window.location.origin, {query: 'user='+name, type: 'desktop'});

    me.canvas = document.querySelector('#area');
    me.ctx = me.canvas.getContext('2d');
    me.ctx.lineWidth = 5;
    me.arena = game.createArena('white', /*230*/me.canvas.height/2-10, me.canvas.width/2, me.canvas.height/2);

    game.socketHandlers.init(me);
    /*me.playerIDs.push('test');
    me.players['test'] = new game.Player(11, 'red', 200, me.canvas.height/2);
    //me.players[12] = new game.Player(12, 'blue', 400, me.canvas.height/2);
    me.players[11].updateAcceleration(0, 0);
    //me.players[12].updateAcceleration(-1/20, 0); 
    */
  },

  loop : function() {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
    this.render();
  },

  updateStartMenu : function() {

  },

  updateGameEnd : function() {

  },

  updateGameLoop : function() {
    var dt = 0;
    var me = this;
    var KOes = 0;
    me.playerIDs.forEach(function(id) {
      var player = me.players[id];
      //Ugly collisions
      if(!this.player.KOed) {
        me.playerIDs.forEach(function(id2){
          
          var player2 = me.players[id2];
          if(player2.id !== player.id){
            
            if(game.physicsUtils.circleCollision(player, player2) && !player.colliding(player2)) {
              //get impulse
              var impulse = game.physicsUtils.getImpulse(player, player2, 1.5);
              player.applyImpulse(impulse);
              player.collisions.push({player: player2, force: impulse});
              impulse.x = impulse.x * -1;
              impulse.y = impulse.y * -1;
              player2.applyImpulse(impulse);
              player2.collisions.push({player: player, force: impulse});
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
      } else 
        this.KOes++;
    });
    
    if(KOes >= me.playerIDs.length)
      me.state = "END";

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
            impulse.x *= 20;
            impulse.y *= 20;
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

  update : function() {
    switch(this.state) {
      case "START" :
        this.updateStartMenu();
        break;
      case "GAME" :
        this.updateGameLoop();
        break;
      case "END" :
        this.updateGameEnd();
        break;
    }
  },

  addSparks : function(c1, c2, impulse) {
    var line = game.physicsUtils.getPerp(game.physicsUtils.getSlope(c1, c2));
    var x = c1.x - (c1.x - c2.x)/2;
    var y = c1.y - (c1.y - c2.y)/2;

    this.sparks.push(new game.Spark(x, y, line.x/5, line.y/5));
    this.sparks.push(new game.Spark(x, y, -line.x/5, -line.y/5));
  },

  renderStart : function() {
    var me = this;
    me.ctx.save();
    me.ctx.fillStyle = 'black';
    me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
    me.ctx.restore();
    me.text(me.ctx, "Players in " + me.playerIDs.length, me.canvas.width, me.canvas.height, 50, "white");
  },

  text: function(ctx, string, x, y, size, col) {
    ctx.font = 'bold '+size+'px Monospace';
    ctx.fillStyle = col;
    ctx.fillText(string, x, y);
  },

  renderGame : function() {
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
  },

  renderEnd : function() {
    var me = this;
    me.ctx.save();
    me.ctx.fillStyle = 'black';
    me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
    me.ctx.restore();
    me.text(me.ctx, "Game Over", me.canvas.width, me.canvas.height, 50, "white");
  },

  render : function() {
    switch(this.state) {
      case "START" :
        this.renderStart();
        break;
      case "GAME" :
        this.renderGame();
        break;
      case "END" :
        this.renderEnd();
        break;
    }
  }
}