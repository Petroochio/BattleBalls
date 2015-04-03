//Function for making Boom objects
"use strict";
var game = game || {};

game.Boom = function() {
  var Boom = function(id, player, pow) {
    this.id = id;
    this.play = player;
    this.radius = 20;
    this.power = pow;
    this.remove = false;
    this.lifeTime = 5;
  };

  var b = Boom.prototype;
  /** Update function to be called every frame
   * @param dt : Delta Time since the last time update was called
   * 
   */
  b.update = function(dt) {
    this.lifeTime --;
    this.radius += this.power;
    if(this.lifeTime <= 0) {
      this.remove = true;
    }
  };
  /** Render function used to draw the object to the screen
   * @param ctx : Drawing context
   * 
   */
  b.render = function(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.7; 
    ctx.fillStyle = this.play.color;
    ctx.strokeStyle = this.play.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.play.color;
    ctx.beginPath();
    ctx.arc(this.play.x, this.play.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };
  
  return Boom;
}();