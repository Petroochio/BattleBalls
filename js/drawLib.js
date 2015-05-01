//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.DrawLib = function() {
    
    init = function(ctx){
        this.ctx  = ctx;
    }

    var p = DrawLib.prototype;
    
    /** rectangle draw method
    * @param x : new x coord
    * @param y : new y coord
    * @param width : width of the rectangle
    * @param height : height of the rectangle
    * @param fillColor : fill color
    * @param strokeColor : stroke color
   */
    p.drawRect = function(x, y, width, height, fillColor, strokeColor) {
        this.ctx.save();
        this.ctx.strokeStyle = this.color;
        this.ctx.strokeRect(this.x - this.width/2, this.y - this.height/2,this.width, this.height);
        this.ctx.restore();
    };
    
    /** circle draw method
    * @param x : new x coord
    * @param y : new y coord
    * @param radius : radius of the circle
    * @param fillColor : fill color
    * @param strokeColor : stroke color
   */
    p.drawCircle = function(x, y, radius, fillColor, strokeColor) {
        this.ctx.save();
        this.ctx.fillStyle = fillColor;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    };
    
 
    /** Draws text to the screen
   * @param ctx : drawing context
   * @param string : text to be rendered
   * @param x : x coord of text
   * @param y : y coord of text
   * @param size : size of text
   * @param col : color of text
   */
    p.drawText = function(string, x, y, size, col) {
        this.ctx.save();
        this.ctx.font = size+'px BAAAAALLLLLLLLLLS';
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = col;
        this.ctx.fillText(string, x, y);
        this.ctx.restore();
    },

    return DrawLib;
}();