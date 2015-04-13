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
    state : "START",

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
        //set up socket
        game.socketHandlers.init(me);
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
            //me.players[id].setPosition(me.canvas.width/2, me.canvas.height/2);
        });
    },
    //Update function for start menu
    updateStartMenu : function() {
        //console.log("START MENU");
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
            console.log("GAME START")
            me.state = "GAME";
            game.socketHandlers.changeState("GAME");
            me.playerIDs.forEach(function(id){
                me.players[id].ready = false;
            });
            me.setPlayerStarts();
        }
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
            this.playerIDs.forEach(function(id){
                me.players[id].ready = false;
                me.players[id].KOed = false;
            });
            me.setPlayerStarts();
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
            me.state = "END";
            game.socketHandlers.changeState("END");
        }
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

        this.arena.radius -= 0.01;
    },
    //Update loop that handles all states
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
            default :
                break;
        }
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
        me.text(me.ctx, "Players in " + me.playerIDs.length, me.canvas.width/2, me.canvas.height/4, 100, "white");

        me.playerIDs.forEach(function(id) {
            var player = me.players[id];
            if(player.ready) {
                me.ctx.save();
                me.ctx.shadowBlur = 10;
                me.ctx.shadowColor = player.color;
                me.text(me.ctx, "player",me.canvas.width/2,me.canvas.height/2,50,player.color);
                me.ctx.restore();
            } else {
                me.text(me.ctx, "player",me.canvas.width/2,me.canvas.height/2,50,player.color);
            }
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
        me.text(me.ctx, "Game Over", me.canvas.width/2, me.canvas.height/2, 100, "white");
    },
    //Main render function that handles different render states
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
            default :
                break;
        }
    }
}