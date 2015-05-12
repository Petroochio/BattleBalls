//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.Button = function() {
    /** constructor for circular button
    * @param ctx : the canvas drawing context
    * @param x : new x coord
    * @param y : new y coord
    * @param radius : width of the rectangle
    * @param id : string  for the button
    * @param color : rendering color
   */
    var Button = function(ctx, x, y, radius, id, player, controller) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        //        this.width = undefined;
        //        this.height = undefined;
        this.id = id;
        this.color = controller.color;
        this.player = player;
        
        this.controller = controller;
        
        this.socket = io.connect( window.location.origin, {query: 'user='+name});

        this.held = false;
        this.currentlyPressed = false;
        this.previouslyPressed = false;
    };

    /** constructor for rectangular button
    * @param ctx : the canvas drawing context
    * @param x : new x coord
    * @param y : new y coord
    * @param width : width of the rectangle
    * @param height : height of the rectangle
    * @param id : string id for the button
    * @param color : rendering color
   */
    /*var Button = function(ctx, x, y, width, height, id, color){
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.radius = undefined;
        this.id = id;
        this.color = color;

        this.held = false;
        this.currentlyPressed = false;
        this.previouslyPressed = false;
    }*/

    var p = Button.prototype;

    p.update = function(dt) {        
        if(game.controller.touching &&
           game.controller.xTap >= this.x-this.radius && game.controller.xTap <= this.x+this.radius &&
           game.controller.yTap >= this.y-this.radius && game.controller.yTap <= this.y+this.radius){
            this.updateState(true);
            this.throwEvents();
            
        }else if(!game.controller.touching){
            this.updateState(false);
            this.throwEvents();
        }
        this.updatePreviousState();
        this.setHeld();
        this.throwEvents();
    };

    //render the button
    p.render = function()
    {
        this.ctx.save();
        this.ctx.lineWidth = 5;
        this.ctx.shadowBlur= 15;
        this.ctx.shadowColor = this.color;

        //draw based on current press state
        if(!this.currentlyPressed){
            game.DrawLib.drawCircle(this.ctx, this.x, this.y, this.radius, 'black', this.color);
            if(this.id != "ready")
            {
                this.ctx.save();
                this.ctx.translate(this.x - (this.radius/3),this.y);
                this.ctx.rotate(Math.PI/2);
                game.DrawLib.drawText(this.ctx, this.id, 0, 0, this.radius-(this.radius/4), this.color);
                this.ctx.restore();
            }
            else{
                game.DrawLib.drawText(this.ctx, this.id, this.x, this.y+(this.radius-(this.radius/4))/2, this.radius-(this.radius/4), this.color);
            }
        }
        else{
            this.ctx.shadowBlur = 0;
            game.DrawLib.drawCircle(this.ctx, this.x, this.y, this.radius-this.radius/4, 'black', this.color);
            if(this.id != "ready")
            {
                this.ctx.save();
                this.ctx.translate(this.x - (this.radius/5), this.y);
                this.ctx.rotate(Math.PI/2);
                
                game.DrawLib.drawText(this.ctx, this.id, 0, 0, this.radius-(this.radius/2), this.color);
                this.ctx.restore();
            }
            else{
                game.DrawLib.drawText(this.ctx, this.id, this.x, this.y+(this.radius-(this.radius/2))/2, this.radius-(this.radius/2), this.color);
            }
            
        }
        this.ctx.restore();
    }

    //check and see if the button is currently held down
    p.setHeld = function(){
        if(this.currentlyPressed == true && this.previouslyPressed == true)
        {
            this.held = true;
        }
        else if (this.currentlyPressed == false && this.previouslyPressed == true)
        {
            this.held = false;
        }
    };

    /** update the button state
    * @param state : current pressed state of the button 
    */
    p.updateState = function(state){
        this.previouslyPressed = this.currentlyPressed;
        this.currentlyPressed = state;
    };
    
    p.updatePreviousState = function()
    {
        this.previouslyPressed = this.currentlyPressed;
    }
    
    p.throwEvents = function(){
        if(this.id != "ready"){
            if(this.previouslyPressed == false && this.currentlyPressed == true) //begin press event
            {
                var data = { id: this.player, type: this.id, room: this.controller.room };
                this.socket.emit('charge start', data);
            }
            else if(this.previouslyPressed == true && this.currentlyPressed == true) //held event
            {
              console.log("held");  
            }
            else if(this.previouslyPressed == true && this.currentlyPressed == false) // end press event
            {
                var data = { id: this.player, type: this.id, room: this.controller.room };
                this.socket.emit('charge end', data);
            }
        }
        else{
            if(this.previouslyPressed == true && this.currentlyPressed == false)
            {
//                document.getElementById("join").style.display = "none";
//                document.getElementById("myCanvas").style.display = "block";
                this.socket.emit('player ready', {id : this.player, room: this.controller.room});//ADD ROOM CODE
                this.controller.ready = !this.controller.ready;
            }
        }
    }

    return Button;
}();