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


    update : function(dt) {
      /*this.y -= speed;

      if(this.y < -10) {
        this.remove = true;
      }*/
    },

    move : function(dt) {
      this.y += this.velocity.y;
      this.x += this.velocity.x;
    },

    render : function(ctx) {
      ctx.save();
      ctx.fillStye = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  return spark;
}