//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Ghost = function() {
    var Ghost = function(id, color, x, y) {
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
        this.charging = false;
        this.chargeType = undefined;
//        this.charges = {brake: false, sling: false};
//        this.chargesReady = {brake: true, sling: true};
//        this.slingTime = 0;
        this.maxCharge = 200;
//        this.brakePower =  50;
        this.collisions = [];
        this.target = {x: x, y: y};
        this.KOed = false;
        this.ready = false;
        this.power1Name = "tele";
//        this.oldX = 0;
//        this.oldY = 0;
        this.child = {x:0,y:0,r:0,velocity:{x:0,y:0},xAcc:0,yAcc:0};
        this.childActive = false;
        this.power2Name = "scare";
    };

    var g = Ghost.prototype;

    g.update = function(dt) {
//        this.stunned = false;
        this.updateCollisions();
        this.updateCharge(dt);
        this.updateStun(dt);
        this.calculateVelocity(dt);
        this.move(dt);
    };
    
    g.beginTele = function(){
        console.log("begin tele");
//        this.oldX = this.x;
//        this.oldY = this.y;
        this.child.x = this.x;
        this.child.y = this.y;
        this.child.r = this.radius/2;
        this.child.velocity.x = this.velocity.x;
        this.child.velocity.y = this.velocity.y;
        this.child.xAcc = this.xAcc;
        this.child.yAcc = this.yAcc;
        this.childActive = true;
        
        //test
        this.velocity.x=0;
        this.velocity.y=0;
        this.xAcc=0;
        this.yAcc=0;
    }

    g.beginCharge = function(type) {
        this.charging = true;
        this.chargeType = type;
        if(type === "tele") {
            this.beginTele();
        }
        /*
        if(!this.charges[type]) {
            if(type === 'brake'){
                this.charges[type] = true;
            } else {
                this.charges[type] = true;
                this.target.x = this.x;
                this.target.y = this.y;
            }
        }
        */
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
        if(this.chargeType == "tele") this.handleTele();
        else if(this.chargeType == "scare") this.handleScare();
    };
    
    g.handleTele = function() {
        console.log("handle tele");
        this.child.r -= 0.05;
    };

    g.handleBrakes = function(){
        if(/*this.chargesReady.brake && */this.charges.brake /*&& this.breakPower > 0*/){
            this.brakePower--;
            this.mu = .2;
            console.log('brake')
        } else {
            this.mu = .95;
            //this.endCharge('brake');
        }

        if(this.brakePower < 1)
            this.chargesReady.brake = false

            if(!this.canBrake)
                this.chargesReady.brake = (this.brakePower >= 50);
    }

    g.handleSling = function() {
        if(this.charges.sling)
            this.slingTime ++;

        if(this.slingTime >= this.maxCharge) {
            this.endCharge('sling');
            this.slingTime = 0;
            this.slingCooldown = 100;
        }
        this.slingCooldown--;
        this.chargesReady.sling = (this.slingCooldown < 1);

    };

    g.endCharge = function(type) {
        if(type === "tele") {
            this.childActive = false;
            this.x = this.child.x;
            this.y = this.child.y;
        }
        /*
        this.charges[type] = false;
        //send sling
        if(type === "sling"){
            //calc distance
            var xDist = this.target.x - this.x;
            var yDist = this.target.y - this.y;
            //apply force
            var impulse = {x:xDist, y:yDist};
            impulse.x *= 1.7;
            impulse.y *= 1.7;

            this.applyImpulse(impulse);
            //reset
        }
        */
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
        /*
        if(!this.childActive) {
            this.velocity.x += this.xAcc;
            this.velocity.y += this.yAcc;
        }
        else {
            this.child.velocity.x += this.child.xAcc;
            this.child.velocity.y += this.child.yAcc;
        }
        */
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
        /*
        if(!this.childActive) {
            this.y += this.velocity.y * scale;
            this.x += this.velocity.x * scale;
        } else {
            this.child.y += this.child.velocity.y*scale;
            this.child.x += this.child.velocity.x*scale;
        }
        */
    };

    g.applyImpulse = function(impulse) {
        this.velocity.x += impulse.x/this.mass;
        this.velocity.y += impulse.y/this.mass;
    };
    ///////////////////
    //RENDER FUNCTIONS
    ///////////////////
    g.render = function(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
//        ctx.strokeStyle = this.stunned ? 'grey' : this.color;
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
        else if(this.chargeType == "scare") this.drawScare(ctx);
    };
    
    g.drawTele = function(ctx){
        if(this.childActive){
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.child.x,this.child.y,this.child.r,0,Math.PI*2,false);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    return Ghost;
}();