//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.Boom = function() {
  var Boom = function(x,y, pow) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.power = pow;
    this.color = 'white';
    this.remove = false;
    this.lifeTime = 20;
  };

  var b = Boom.prototype;

  b.update = function(dt) {
    this.move(dt);
    this.lifeTime --;
    if(this.lifeTime <= 0) {
      this.remove = true;
    }
  };

  b.render = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  
  return Boom;
}();