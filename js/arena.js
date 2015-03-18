//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.createArena = function( color, r, x, y ) {
  var arena = {
    x: x,
    y: y,
    radius: r,
    mu : 0.95,

    inBounds : function(player) {
      var bound = {
        x: this.x,
        y: this.y,
        radius: this.radius - player.radius/5
      };
      return game.physicsUtils.circleCollision(bound, player);
    },

    render : function(ctx) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  return arena;
}