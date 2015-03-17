//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.createPlayer = function(id, color, x, y) {
  var player = {
    x: x,
    y: y,
    xAcc: 0,
    yAcc: 0,
    velocity : {x: 0, y: 0},
    radius: 20,
    speed: 1,
    id : id,
    color : color,
    mu : 0.95,
    mass : 10,

    update : function(dt) {
      this.calculateVelocity(dt);
      this.move(dt);
    },

    calculateVelocity : function(dt) {
      this.applyFriction();
      this.velocity.x += this.xAcc;
      this.velocity.y += this.yAcc;
    },

    updateAcceleration : function(x,y) {
      this.xAcc = x;
      this.yAcc = y;
    },

    applyFriction : function() {
      this.velocity.x = this.velocity.x * this.mu;
      this.velocity.y = this.velocity.y * this.mu;
    },

    move : function(dt) {
      this.y += this.velocity.y;
      this.x += this.velocity.x;
    },

    applyImpulse : function(impulse) {
      this.velocity.x = 0 + impulse.x/this.mass;
      this.velocity.y = 0 + impulse.y/this.mass;
    },

    render : function(ctx) {
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return player;
}