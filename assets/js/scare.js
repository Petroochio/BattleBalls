"use strict";
var game = game || {};

game.Scare = function() {
    var Scare = function(id, player){
        this.id = id;
        this.play = player;
        this.radius = 30;
        this.alpha = 1;
        this.opacDir = -1;
        this.remove = false;
    };
    
    var s = Scare.prototype;
    
    s.update = function(dt) {
        if(this.alpha <= 0.2 /*|| this.alpha >= 0.9*/) this.opacDir = 1;
        else if(this.alpha >= 1) this.opacDir = -1;
        this.alpha += 0.03*this.opacDir;
    };
    
    s.render = function(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.play.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.play.color;
        game.DrawLib.drawCircle(ctx,this.play.x,this.play.y,this.radius,this.play.color,this.play.color);
        ctx.restore();
    };
    
    return Scare;
}();