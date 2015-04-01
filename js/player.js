//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Player = function() {
  var Player = function(id, color, x, y) {
    this.x = x;
    this.y = y;
    this.xAcc = 0;
    this.yAcc = 0;
    this.velocity = {x: 0, y: 0};
    this.radius = 20;
    this.speed = 1;
    this.id = id;
    this.color = color;
    this.mu = 0.95;
    this.mass = 10;
    this.charging = false;
    this.charge = 0;
    this.maxCharge = 100;
    this.coolDown = 0;
    this.collisions = [];
  }

  var p = Player.prototype;

  p.update = function(dt) {
    this.updateCollisions();
    this.calculateVelocity(dt);
    this.updateCharge(dt);
    this.move(dt);
  };

  p.beginCharge = function() {
    this.charging = (this.coolDown <= 0);
  };

  p.updateCharge = function(dt) {
    if(this.charging) {
      this.charge++;
    } else {
      this.coolDown--;
    }

    if(this.charge >= this.maxCharge) {
       this.endCharge();
    }
  };

  p.endCharge = function() {
    if(this.charging) {
      //2 references to global game obj, fix this
      var boom = new game.Boom(this.id, this, this.charge/(this.maxCharge/3) + .25);
      game.battleBalls.booms[this.id] = boom;
      this.charge = 0;
      this.charging = false;
      this.coolDown = 100;
    }
  };

  p.updateCollisions = function() {
    var self = this;
    this.collisions.forEach(function(ball, index, array){
      if(!game.physicsUtils.circleCollision(ball, self)) {
        array.splice(index, 1);
      }
    });
  };

  p.colliding = function(player) {
    var collide = false;
    this.collisions.forEach(function(ball){
      if(ball === player) {
        collide = true;
      }
    });
    return collide;
  };

  p.calculateVelocity = function(dt) {
    this.applyFriction();
    this.velocity.x += this.xAcc;
    this.velocity.y += this.yAcc;
  };

  p.updateAcceleration = function(x,y) {
    this.xAcc = x;
    this.yAcc = y;
  };

  p.applyFriction = function() {
    this.velocity.x = this.velocity.x * this.mu;
    this.velocity.y = this.velocity.y * this.mu;
  };

  p.move = function(dt) {
    var scale = 1;
    scale = this.charging ? 0.5 : scale;

    this.y += this.velocity.y * scale;
    this.x += this.velocity.x * scale;
  };

  p.applyImpulse = function(impulse) {
    //this.velocity.x = 0 + impulse.x/this.mass;
    //this.velocity.y = 0 + impulse.y/this.mass;
    this.velocity.x += impulse.x/this.mass;
    this.velocity.y += impulse.y/this.mass;
  };

  p.render = function(ctx) {
    //draw another circle maybe?
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };
  
  return Player;
}();