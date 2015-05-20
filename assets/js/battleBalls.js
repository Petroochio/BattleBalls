//Main game file
"use strict";
var game = game || {};
//Battle balls game file
game.battleBalls = {
    canvas : undefined,
    ctx : undefined,
    arena : undefined,
    playerIDs : [],
    players : {},
    sparks : [],
    booms : [],
    scares : [],
    state : "START",
    startDelay : 500,
    arenaShrinkDelay : /*1000*/200,
    ticker: 200,
    winner: undefined,
    
    bgMusic : undefined,
    chargeSound : undefined,
    dashSound : undefined,
    boomSound : undefined,
    readySound : undefined,
    collideSound : undefined,
    

    init : function(){
        var me = this;
        // create new instance of socket.io
        var num = Math.floor(Math.random()*10);
        var name ='user'+num;
        //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
        me.canvas = document.querySelector('#area');
        me.ctx = me.canvas.getContext('2d');
        me.ctx.lineWidth = 5;
        me.arena = game.createArena('white', me.canvas.height/2-10, me.canvas.width/2, me.canvas.height/2);
        //set up sounds
        me.bgMusic = document.querySelector("#bgMusic");
        me.bgMusic.volume = 0.2;
        me.bgMusic.play();
        
        me.chargeSound = document.querySelector("#chargeSound");
        me.chargeSound.volume = 1;

        me.dashSound = document.querySelector("#dashSound");
        me.dashSound.volume = 1;
        
        me.boomSound = document.querySelector("#boomSound");
        me.boomSound.volume = 1;
        
        me.readySound = document.querySelector("#readySound");
        me.readySound.volume = 1;
        
        me.collideSound = document.querySelector("#collideSound");
        me.collideSound.volume = 1;
        
        //set up socket
        game.socketHandlers.init(me);//This line of code needs to be called last
    },
    //main loop
    loop : function() {
        requestAnimationFrame(this.loop.bind(this));
        this.update();
        this.render();
    },
    //Sets start positions of all players
    setPlayerStarts : function() {
        var theta = 2*Math.PI/this.playerIDs.length; //Distance between each player
        var playerPositions = []; //Array of player start positions
        var startDist = 100; //Distance from center of map
        for(var i = 0; i < this.playerIDs.length; i++) {
            var point = {};
            point.x = this.canvas.width/2 + startDist*Math.cos(theta * i);
            point.y = this.canvas.height/2 + startDist*Math.sin(theta * i);
            playerPositions[i] = point;
        }
        var me = this;
        //set each player's position
        this.playerIDs.forEach(function(id, index){
            me.players[id].setPosition(playerPositions[index].x, playerPositions[index].y);
            me.players[id].updateAcceleration(0,0);
            me.players[id].velocity = {x: 0, y: 0};
            //me.players[id].setPosition(me.canvas.width/2, me.canvas.height/2);
        });
    },
    //Update function for start menu
    updateStartMenu : function() {
        var canStart = true;
        var me = this;
        //Check if all players are ready
        me.playerIDs.forEach(function(id){
            if(!me.players[id].ready)
                canStart = false;
        });
        //If all players are read and there are more than 2
        if(me.playerIDs.length >= 2 && canStart) {
            //Begin game
            me.state = "ONBOARD";
            game.socketHandlers.changeState("GAME");
            me.reset();
        }
        
        //audio controls
        if(me.bgMusic.currentTime >= 80) me.bgMusic.currentTime = 0;
    },
    //update function for end game screen
    updateGameEnd : function() {
        var canStart = true;
        var me = this;
        //Check if all players are ready
        this.playerIDs.forEach(function(id){
            if(!me.players[id].ready)
                canStart = false;
        });
        //If players are ready play again
        if(this.playerIDs.length >= 2 && canStart) {
            this.state = "GAME";
            game.socketHandlers.changeState("GAME");
            me.bgMusic.currentTime = 80;
            me.reset();
        }
    },
    //Main game loop
    updateGameLoop : function() {
        var dt = 0;
        var me = this;//save reference to this
        var KOes = 0;//number of players knocked out
        //Loop through all players
        me.playerIDs.forEach(function(id) {
            var player = me.players[id];//get player reference
            //If the player isn't knocked out
            if(!player.KOed) {
                //loop through the rest of the players for collisions
                me.playerIDs.forEach(function(id2){
                    var player2 = me.players[id2]; //reference to player to collide with
                    if(player2.id !== player.id){//if the players aren't the same
                        //Check collision if they aren't already colliding
                        if(game.physicsUtils.circleCollision(player, player2) && !player.colliding(player2)) {
                            me.collideSound.play();
                            //get impulse
                            var impulse = game.physicsUtils.getImpulse(player, player2, 1.5);
                            player.applyImpulse(impulse);//apply impluse to first player
                            player.collisions.push({player: player2, force: impulse});//Add collision to player obj
                            //get inverse of impulse
                            impulse.x = impulse.x * -1;
                            impulse.y = impulse.y * -1;
                            player2.applyImpulse(impulse);//send inverse to second player
                            player2.collisions.push({player: player, force: impulse});
                            //me.addSparks(player, player2, impulse);
                        }
                    }
                });
                //Bad code for resetting player if they leave the arena
                if(!me.arena.inBounds(player)) {
                    /*player.x = me.canvas.width/2;
          player.y = me.canvas.width/2;*/
                    player.KOed = true;
                }
                player.update(dt);//update the player
            } else {//if the player is koed
                KOes++;
            }
        });
        //If all players are knocked out end the game
        if(KOes >= me.playerIDs.length -1 && me.playerIDs.length > 1) {
            me.playerIDs.forEach(function(id){
                var player = me.players[id];
                if(!player.KOed) me.winner = player;
            });
            me.state = "END";
            game.socketHandlers.changeState("END");
        }
        me.scares.forEach(function(scare,index,array){
            scare.update(dt);
            var scarec = {
                x: scare.play.x,
                y: scare.play.y,
                velocity: {x:0,y:0},
                radius: scare.radius
                //other stuff?
            };
            me.playerIDs.forEach(function(id){
                var player = me.players[id];
                if(scare.id !== player.id){
                    if(game.physicsUtils.circleCollision(player, scarec)){
                        var impulse = {x:0,y:0};
                        impulse = game.physicsUtils.normalize(game.physicsUtils.vecDiff(player,scarec));
//                        impulse *= 2;
//                        impulse *= 2;
                        player.applyImpulse(impulse);
                    }
                }
            });
            if(scare.remove){
                array.splice(index,1);
            }
        });
        //Loop through and update akk if the booms
        me.booms.forEach(function(boom, index, array){
            boom.update(dt);//update boom
            //make a copy of the boom
            var boomc = {
                x : boom.play.x,
                y : boom.play.y,
                velocity : {x:0, y:0},
                mass : boom.pow * 20,
                radius : boom.radius
            };
            //!!!!!!!!!!!!!!duplicate, make a helper function
            //Loop through all players
            me.playerIDs.forEach(function(id){
                var player = me.players[id];
                if(boom.id !== player.id){
                    //check for collison between a boom and other players
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
            //remove a boom if it is done
            if(boom.remove) {
                array.splice(index, 1);
            }
        });
        //loop through the sparks
        this.sparks.forEach(function(spark, index, array){
            spark.update(dt);
            if(spark.remove) {
                array.splice(index, 1);
            }
        });
//        if(this.arenaShrinkDelay < 1)
          this.arena.radius -= 0.03;
//        else
//          this.arenaShrinkDelay--;
        
        if(me.bgMusic.currentTime < 80) me.bgMusic.currentTime = 80;
    },
    updateOnboard: function() {
        if(this.ticker <= 0){
            this.state = "GAME";
        }
        this.ticker--;
    },
    //Update loop that handles all states
    update : function() {
        switch(this.state) {
            case "START" :
                this.updateStartMenu();
                break;
            case "ONBOARD" :
                this.updateOnboard();
                break;
            case "GAME" :
                //if(this.startDelay < 1)
                  this.updateGameLoop();
                //else 
                  //this.startDelay--;
                break;
            case "END" :
                this.updateGameEnd();
                break;
            default :
                break;
        }
    },
    //Resets game to state at start of game loop
    reset : function() {
      var me = this;
      me.arenaShrinkDelay = 10000;
      me.startDelay = 500;
      me.arena.radius = me.canvas.height/2-10;
      this.playerIDs.forEach(function(id){
        me.players[id].ready = false;
        me.players[id].KOed = false;
      });
      me.setPlayerStarts();
        me.scares = [];
    },
    /** Creates sparks based on an impulse
   * @param c1 : first circle object in collison
   * @param c2 : second circle object in collison
   * @param impulse : impulse the sparks are created from
   */
    addSparks : function(c1, c2, impulse) {
        /*var line = game.physicsUtils.getPerp(game.physicsUtils.getSlope(c1, c2));
    var x = c1.x - (c1.x - c2.x)/2;
    var y = c1.y - (c1.y - c2.y)/2;

    this.sparks.push(new game.Spark(x, y, line.x/5, line.y/5));
    this.sparks.push(new game.Spark(x, y, -line.x/5, -line.y/5));*/
    },
    //Draw function for the start menu
    renderStart : function() {
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
        me.ctx.restore();
        me.text(me.ctx, "battle balls", me.canvas.width/2, me.canvas.height/4, 100, "white");
        me.text(me.ctx, "enter url on phone to connect", me.canvas.width/2, me.canvas.height/4+35, 30, "white");
        me.text(me.ctx, "room code: "+game.socketHandlers.room, me.canvas.width/2, me.canvas.height/4+80, 40, "white");

        me.playerIDs.forEach(function(id, index) {
            var player = me.players[id];
            var xSpacing = index%2;
            var ySpacing;
            switch(index){ //there is prolly a better way to do this
                case 0:
                case 1:
                    ySpacing = 0;
                    break;
                case 2:
                case 3:
                    ySpacing = 1;
                    break;
                case 4:
                case 5:
                    ySpacing = 2;
                    break;
                case 6:
                case 7:
                    ySpacing = 3;
                    break;
            }
            me.ctx.save();
            me.ctx.strokeStyle = player.color;
            me.ctx.fillStyle = player.color;
            if(player.ready) {
                me.ctx.shadowBlur = 10;
                me.ctx.shadowColor = player.color;

                me.text(me.ctx, player.name,
                        me.canvas.width/4+(xSpacing*me.canvas.width/3+xSpacing*20),
                        me.canvas.height/2+ySpacing*55+20,
                        50,player.color);
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55+20,
                           20,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.stroke();
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55+20,
                           10,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.fill();
            } else {

                me.text(me.ctx, player.name,
                        me.canvas.width/4+(xSpacing*me.canvas.width/3+xSpacing*20),
                        me.canvas.height/2+ySpacing*55+20,
                        50,player.color);
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55+20,
                           20,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.stroke();
            }
            me.ctx.restore();
        });

    },
    /** Draws text to the screen
   * @param ctx : drawing context
   * @param string : text to be rendered
   * @param x : x coord of text
   * @param y : y coord of text
   * @param size : size of text
   * @param col : color of text
   */
    text: function(ctx, string, x, y, size, col) {
        ctx.save();
        ctx.font = size+'px BAAAAALLLLLLLLLLS';
        ctx.textAlign = "center";
        ctx.fillStyle = col;
        ctx.fillText(string, x, y);
        ctx.restore();
    },
    //Render in game screen
    renderGame : function() {
        var me = this;//save reference to this
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
        me.ctx.restore();
        me.arena.render(me.ctx);//draw arena
        //loop through and draw each player
        me.playerIDs.forEach(function(id) {
            var player = me.players[id];
            player.render(me.ctx);
        });
        //loop through and draw each boom
        me.booms.forEach(function(boom) {
            boom.render(me.ctx);
        });
        me.scares.forEach(function(scare){
            scare.render(me.ctx);
        });
        //loop through and draw each spark
        me.sparks.forEach(function(spark) {
            spark.render(me.ctx);
        });
    },
    //Draw function for the end game screen
    renderEnd : function() {
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0, me.canvas.width, me.canvas.height);
        me.ctx.restore();
//        me.text(me.ctx, "Game Over", me.canvas.width/2, me.canvas.height/4, 100, "white");
        me.text(me.ctx,"ready up to play again",me.canvas.width/2,me.canvas.height/4+50,50,"white");
        
        me.playerIDs.forEach(function(id, index) {
            var player = me.players[id];
            var xSpacing = index%2;
            var ySpacing;
            switch(index){ //there is prolly a better way to do this
                case 0:
                case 1:
                    ySpacing = 0;
                    break;
                case 2:
                case 3:
                    ySpacing = 1;
                    break;
                case 4:
                case 5:
                    ySpacing = 2;
                    break;
                case 6:
                case 7:
                    ySpacing = 3;
                    break;
            }
            if(player.id == me.winner.id) me.text(me.ctx,player.name+" won",me.canvas.width/2,me.canvas.height/4,100,"white");

            
            me.ctx.save();
            me.ctx.strokeStyle = player.color;
            me.ctx.fillStyle = player.color;
            if(player.ready) {
                me.ctx.shadowBlur = 10;
                me.ctx.shadowColor = player.color;
                me.text(me.ctx, player.name,
                        me.canvas.width/4+(xSpacing*me.canvas.width/3+xSpacing*20),
                        me.canvas.height/2+ySpacing*55,
                        50,player.color);
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55,
                           20,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.stroke();
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55,
                           10,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.fill();
            } else {

                me.text(me.ctx, player.name,
                        me.canvas.width/4+(xSpacing*me.canvas.width/3+xSpacing*20),
                        me.canvas.height/2+ySpacing*55,
                        50,player.color);
                
                me.ctx.beginPath();
                me.ctx.arc((me.canvas.width*2/5+20)+(xSpacing*me.canvas.width/3+xSpacing*20),
                           me.canvas.height/2-20+ySpacing*55,
                           20,0,Math.PI*2,false);
                me.ctx.closePath();
                me.ctx.stroke();
            }
            me.ctx.restore();
        });
    },
    
    renderOnboard: function() {
        var me = this;
        me.ctx.fillStyle = "black"
        me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
        me.text(me.ctx,"hold phone horizontal",me.canvas.width/2,me.canvas.height/4,50,"white");
        me.text(me.ctx,"tilt phone to move",me.canvas.width/2,me.canvas.height/4+50,50,"white");
        me.text(me.ctx,"power controls on phone",me.canvas.width/2,me.canvas.height/4+150,50,"white");
    },
    
    //Main render function that handles different render states
    render : function() {
        switch(this.state) {
            case "START" :
                this.renderStart();
                break;
            case "ONBOARD" :
                this.renderOnboard();
                break;
            case "GAME" :
                this.renderGame();
                break;
            case "END" :
                this.renderEnd();
                break;
            default :
                break;
        }
    }
}