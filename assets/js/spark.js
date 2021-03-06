//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.Spark = function() {
  var Spark = function(x, y, xVel, yVel) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 100;
    this.velocity = { x: xVel, y: yVel};
    this.color = 'white';
    this.remove = false;
    this.lifeTime = 20;
  };

  var sp = Spark.prototype;

  sp.update = function(dt) {
    /*this.y -= speed;
    if(this.y < -10) {
      this.remove = true;
    }*/
    this.move(dt);
    this.lifeTime --;
    if(this.lifeTime <= 0) {
      this.remove = true;
    }
  };

  sp.move = function(dt) {
    this.y += this.velocity.y;
    this.x += this.velocity.x;
  };

  sp.render = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  
  return Spark;
}();