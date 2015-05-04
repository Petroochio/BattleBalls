//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.DrawLib = {

    /** rectangle draw method
    * @param x : new x coord
    * @param y : new y coord
    * @param width : width of the rectangle
    * @param height : height of the rectangle
    * @param fillColor : fill color
    * @param strokeColor : stroke color
   */
    drawRect: function(ctx, x, y, width, height, fillColor, strokeColor) {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        ctx.fillRect(x - width/2, y - height/2, width, height);
        ctx.restore();
    },

    /** circle draw method
    * @param x : new x coord
    * @param y : new y coord
    * @param radius : radius of the circle
    * @param fillColor : fill color
    * @param strokeColor : stroke color
   */
    drawCircle: function(ctx, x, y, radius, fillColor, strokeColor) {
        ctx.save();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    },


    /** Draws text to the screen
   * @param ctx : drawing context
   * @param string : text to be rendered
   * @param x : x coord of text
   * @param y : y coord of text
   * @param size : size of text
   * @param col : color of text
   */
    drawText: function(ctx, string, x, y, size, col) {
        ctx.save();
        ctx.font = size+'px BAAAAALLLLLLLLLLS';
        ctx.textAlign = "center";
        ctx.fillStyle = col;
        ctx.fillText(string, x, y);
        ctx.restore();
    },
};