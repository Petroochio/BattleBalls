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
    this.collisions = [];
  }

  var p = Player.prototype;

  p.update = function(dt) {
    this.updateCollisions();
    this.calculateVelocity(dt);
    this.move(dt);
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
    this.y += this.velocity.y;
    this.x += this.velocity.x;
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