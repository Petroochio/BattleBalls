//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Ghost = function() {
    var Ghost = function(id, color, x, y) {
        this.x = x;
        this.y = y;
        this.oldX = undefined;
        this.oldY = undefined;
        this.xAcc = 0;
        this.yAcc = 0;
        this.velocity = {x: 0, y: 0};
        this.radius = 20;
        this.id = id;
        this.color = color;
        this.mu = 0.95;
        this.mass = 10;
        this.charging = false;
        this.chargeType = undefined;
        this.charge = 0;
        this.maxCharge = 170;
        this.coolDown = 0;
        this.stunned = false;
        this.stunTime = 0;
        this.collisions = [];
        this.KOed = false;
        this.ready = false;

        this.power1Name = "tele";
        this.power2Name = "scare";
        this.child = {x: 0, y: 0, r: 0, accel: {x: 0, y: 0}, velocity: {x: 0, y: 0}, setPos: function(x,y,r) {this.x = x; this.y = y; this.r = r; }};
        this.childActive = false;
        //    this.rushPower = 300;
        //    this.dodgeSpeed = 200;
        this.maxVelocity = 5;
        this.velocityMag = 0;
    };

    var g = Ghost.prototype;

    g.update = function(dt) {
        this.updateCollisions();
        this.updateCharge(dt);
        this.updateStun(dt);
        this.calculateVelocity(dt);
        this.move(dt);
    };

    g.beginCharge = function(type) {
        if(!this.stunned && !this.charging) {
            this.charging = (this.coolDown <= 0);
            this.chargeType = type;

            if(type === "tele") {
                //helper function?
                this.oldX = this.x;
                this.oldY = this.y;
                this.child.setPos(this.x,this.y,this.radius);
                this.child.velocity.x = this.velocity.x;
                this.child.velocity.y = this.velocity.y;
                this.childActive = true;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }
    };

    g.updateStun = function(dt) {
        if(this.stunned)
            this.stunTime--;
        this.stunned = !(this.stunTime <= 0);
    };

    g.updateCharge = function(dt) {
        if(this.charging) {
            this.charge++;
            this.handleTele();
            //            this.handleScare();
        }
        else
            this.coolDown--;

        if(this.charge >= this.maxCharge)
            this.endCharge();
    };

    g.handleTele = function() {

    }

    g.endCharge = function() {
        if(this.charging && this.charge < this.maxCharge) {
            if(this.chargeType === "tele"){
                this.doTele();


            } else if(this.charging) {
                //this.stunned = true;
                this.stunTime = 200;
                this.charge = 0;
                this.charging = false;
                this.coolDown = 20;
            }
        }
    }
    
    g.doTele = function() {
        this.childActive = false;
        this.x = this.child.x;
        this.y = this.child.y;
    }

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

        this.velocityMag = Math.sqrt((this.velocity.x * this.velocity.x) + (this.velocity.y*this.velocity.y));   

        if(this.velocityMag > this.maxVelocity)
        {
            this.clampVelocity();
        }
    };

    g.updateAcceleration = function(x,y) {
        if(this.childActive) {
            this.child.accel.x = x;
            this.child.accel.y = y;
        } else {
            this.xAcc = x;
            this.yAcc = y;
        }
    };

    g.applyFriction = function() {
        this.velocity.x = this.velocity.x * this.mu;
        this.velocity.y = this.velocity.y * this.mu;
    };

    g.move = function(dt) {
        var scale = 1;
        scale = (this.charging || this.stunned && !this.childActive) ? 0.5 : scale;

        this.y += this.velocity.y * scale;
        this.x += this.velocity.x * scale;
    };

    g.applyImpulse = function(impulse) {
        this.velocity.x += impulse.x/this.mass;
        this.velocity.y += impulse.y/this.mass;
    };

    g.render = function(ctx) {
        ctx.save();
        //        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.stunned || this.childActive ? 'grey' : this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur=10;
        ctx.shadowColor=this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        if(this.charging)
            this.renderCharge(ctx);
    };

    g.renderCharge = function(ctx) {
        if(this.chargeType === "boom")
            this.drawTeleCharge(ctx);
        else if(this.chargeType === "rush")
            this.drawScareCharge(ctx);
    };

    g.drawTeleCharge = function(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur=10;
        ctx.shadowColor=this.color;
        ctx.stroke();
        ctx.restore();
    };

    g.clampVelocity = function(){ // prevent the velocity from becoming too high for the player to control
        var normVelocity = {x: this.velocity.x / this.velocityMag, y: this.velocity.y / this.velocityMag};
        var clampedVelocity = {x: normVelocity.x * this.maxVelocity, y: normVelocity.y * this.maxVelocity};
        this.velocity = clampedVelocity;
    };

    return Ghost;
}();