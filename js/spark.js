//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.createSpark = function(x, y, xVel, yVel) {
  var spark = {
    x: x,
    y: y,
    radius: 5,
    speed: 100,
    velocity: { x: xVel, y: yVel},
    color : 'white',
    remove : false,
    lifeTime : 20,

    update : function(dt) {
      /*this.y -= speed;
      if(this.y < -10) {
        this.remove = true;
      }*/
      this.move(dt);
      this.lifeTime --;
      if(this.lifeTime <= 0) {
        this.remove = true;
      }
    },

    move : function(dt) {
      this.y += this.velocity.y;
      this.x += this.velocity.x;
    },

    render : function(ctx) {

      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  return spark;
}