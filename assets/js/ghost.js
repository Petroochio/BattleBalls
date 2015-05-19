//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Ghost = function() {
    var Ghost = function(id, color, x, y, name) {
        this.x = x;
        this.y = y;
        this.xAcc = 0;
        this.yAcc = 0;
        this.velocity = {x: 0, y: 0};
        this.radius = 20;
        this.id = id;
        this.color = color;
        this.mu = 0.95;
        this.mass = 10;
        this.stunned = false;
        this.stunTime = 0;
        this.charge = 0;
        this.charging = false;
        this.chargeType = undefined;
        this.coolDown = 0;
        this.maxCharge = 200;
        this.collisions = [];
        this.target = {x: x, y: y};
        this.KOed = false;
        this.ready = false;
        this.power1Name = "tele";
        this.child = {x:0,y:0,r:0,velocity:{x:0,y:0},xAcc:0,yAcc:0};
        this.childActive = false;
        this.power2Name = "scare";
        this.scare = undefined;
        this.name = name;
    };

    var g = Ghost.prototype;

    g.update = function(dt) {
        this.updateCollisions();
        this.updateCharge(dt);
        this.updateStun(dt);
        this.calculateVelocity(dt);
        this.move(dt);
    };
    
    g.beginTele = function(){
        this.child.x = this.x;
        this.child.y = this.y;
        this.child.r = this.radius/2;
        this.child.velocity.x = this.velocity.x;
        this.child.velocity.y = this.velocity.y;
        this.child.xAcc = this.xAcc;
        this.child.yAcc = this.yAcc;
        this.childActive = true;
        
        this.velocity.x=0;
        this.velocity.y=0;
        this.xAcc=0;
        this.yAcc=0;
    };
    
    g.beginScare = function() {
        this.scare = new game.Scare(this.id,this);
        game.battleBalls.scares.push(this.scare);
    }

    g.beginCharge = function(type) {
        if(!this.stunned && this.coolDown <= 0){
            this.charging = true;
            this.chargeType = type;
            if(type === "tele") this.beginTele();
            else if(type === "scare" && this.coolDown == 0) {
                this.beginScare();
            }
        }
    };

    g.updateStun = function(dt) {
        if(this.stunned)
            this.stunTime--;
        this.stunned = !(this.stunTime <= 0);
    };
    //////////////////
    //CLASS SPECIFIC
    //////////////////
    g.updateCharge = function(dt) {
        if(this.charging){
            if(this.chargeType == "tele") this.handleTele();
            else if(this.chargeType == "scare") this.handleScare();
        } else if(this.coolDown > 0)
            this.coolDown--;
    };
    
    g.handleTele = function() {
        this.child.r -= 0.05;
        if(this.child.r <= 0) this.endCharge("tele");
    };
    
    g.handleScare = function() {
        this.charge++;
        if(this.charge >= this.maxCharge) this.endCharge("scare");
    };

    g.endCharge = function(type) {
        if(type === "tele") {
            if(this.child.r <= 0 && this.childActive){
                this.stunned = true;
                this.stunTime = 200;
            } else if(this.child.r > 0 && this.childActive){
                this.x = this.child.x;
                this.y = this.child.y;
            }
            this.childActive = false;
        }
        if(type === "scare") {
            if(this.charge >= this.maxCharge){
                this.stunned = true;
                this.stunTime = 200;
            }
            this.scare.remove = true;
            this.charge = 0;
            this.coolDown = 30;
        }
        this.charging = false;
    };
    /////////////////////////
    //BASE CODE
    /////////////////////////

    g.updateCollisions = function() {
        var self = this;
        this.collisions.forEach(function(ball, index, array){
            if(!game.physicsUtils.circleCollision(ball.player, self))
                array.splice(index, 1);
            // else
            //   self.applyImpulse(ball.force);
        });
    };
    /** Sets player positon
   * @param x : new x coord
   * @param y : new y coord
   */
    g.setPosition = function(x,y) {
        this.x = x;
        this.y = y;
    };

    g.colliding = function(player) {
        var collide = false;
        this.collisions.forEach(function(ball){
            if(ball.player === player)
                collide = true;
        });
        return collide;
    };

    g.calculateVelocity = function(dt) {
        this.applyFriction();
        this.velocity.x += this.xAcc;
        this.velocity.y += this.yAcc;
        if(this.childActive){
            this.child.velocity.x += this.child.xAcc;
            this.child.velocity.y += this.child.yAcc;
        }
    };

    g.updateAcceleration = function(x,y) {
        if(!this.childActive) {
            this.xAcc = x;
            this.yAcc = y;
        } else {
            this.child.xAcc = x;
            this.child.yAcc = y;
        }
    };

    g.applyFriction = function() {
        this.velocity.x = this.velocity.x * this.mu;
        this.velocity.y = this.velocity.y * this.mu;
        if(this.childActive) {
            this.child.velocity.x = this.child.velocity.x * this.mu;
            this.child.velocity.y = this.child.velocity.y * this.mu;
        }
    };

    g.move = function(dt) {
        var scale = 1;
        scale = (this.charging || this.stunned) ? 0.5 : scale;
        this.y += this.velocity.y * scale;
        this.x += this.velocity.x * scale;
        if(this.childActive) {
            this.child.y += this.child.velocity.y*scale;
            this.child.x += this.child.velocity.x*scale;
        }
    };

    g.applyImpulse = function(impulse) {
        if(this.charging && this.chargeType == "scare"){}
        else {
            this.velocity.x += impulse.x/this.mass;
            this.velocity.y += impulse.y/this.mass;
        }
    };
    ///////////////////
    //RENDER FUNCTIONS
    ///////////////////
    g.render = function(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
//        ctx.strokeStyle = this.color;
        ctx.strokeStyle = this.stunned || this.coolDown > 0 ? 'grey' : this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        if(this.charging) this.renderCharge(ctx);
    };

    g.renderCharge = function(ctx) {
        if(this.chargeType == "tele") this.drawTele(ctx);
    };
    
    g.drawTele = function(ctx){
        if(this.childActive){
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.child.x,this.child.y,this.child.r,0,Math.PI*2,false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    return Ghost;
}();