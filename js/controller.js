"use strict";
var game = game || {};

game.controller = {
    canvas: undefined,
    ctx: undefined,
    state: "START",
    color: undefined,
    ready: false,
    touchType: undefined,
    xTap: undefined,
    yTap: undefined,
    readyButton: undefined,

    init: function(){
        //initialize variables
        var me = this;
        me.canvas = document.querySelector("#myCanvas");
        me.ctx = me.canvas.getContext("2d");
        
        me.canvas.width = window.innerWidth;
        me.canvas.height = window.innerHeight;
        
        // create new instance of socket.io
        var num = Math.floor(Math.random()*10);
        var name ='user'+num;
        var id = -1;

        var red = Math.floor(Math.random() * 105 +150);
        var green = Math.floor(Math.random() * 105 +150);
        var blue = Math.floor(Math.random() * 105 +150);
        me.color = 'rgb('+red+','+green+','+blue+')';
        //setting client's own properties (MIGHT NOT BE THE BEST PRACTICE);
        var socket = io.connect( window.location.origin, {query: 'user='+name});

        var connectData = { id: id, color: me.color };

        socket.emit('player join', connectData);

        socket.on('player connect', function(data){
            if(data.id !== -1) {
                id = data.id;
            }
        });

        socket.on('state change', function(data){
            if(data.state === "END") {
                me.state = "START";
            }else if(data.state === "GAME") {
                me.state = "GAME";
                me.ready = false;
            }
        });
        //Event listeners
        me.canvas.addEventListener("touchstart", function(e){
            switch(me.state){
                case "START":
                case "END":
                    break;
                case "GAME":
                    var data = { id: id, type: me.touchType };
                    socket.emit('charge start', data);
                    break;
            }
        });
        
        me.canvas.addEventListener("touchend", function(e){
            switch(me.state){
                case "START":
                case "END":
                    socket.emit('player ready', {id : id});
                    me.ready = !me.ready;
                    break;
                case "GAME":
                    var data = { id: id, type: me.touchType }
                    socket.emit('charge end', data);
                    break;
            }
        });

        me.readyButton = new game.Button(me.ctx, me.canvas.width/2,me.canvas.height/2, 120, 80, 'ready',me.color);
/*
        //initialize Boom Button
        var boomButton = document.querySelector("#button1");
        var boomCTX;
        if (boomButton.getContext) boomCTX = boomButton.getContext("2d");

        //Event listeners
        boomButton.addEventListener("touchstart", function(e){
            var data = { id: id, type: "boom" };
            socket.emit('charge start', data);
            redraw(boomButton, "BOOM",boomCTX);
        }, false);
        boomButton.addEventListener("touchend", function(e){
            var data = { id: id };
            socket.emit('charge end', data);
            draw(boomButton, "BOOM",boomCTX);
        }, false);
        draw(boomButton, "BOOM",boomCTX);

        //initialize Dash Button
        var dashButton = document.querySelector("#button2");
        var dashCTX;
        if (dashButton.getContext) dashCTX = dashButton.getContext("2d");

        //Event listeners
        dashButton.addEventListener("touchstart", function(e){
            //hello peter
            var data = { id: id, type: "dash" };
            socket.emit('charge start', data);
            redraw(dashButton, "DASH",dashCTX);
        }, false);
        dashButton.addEventListener("touchend", function(e){
            //hello peter
            var data = { id: id };
            socket.emit('charge end', data);
            draw(dashButton, "DASH",dashCTX);
        }, false);
        draw(dashButton, "DASH",dashCTX);
*/
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function(e) {
                // gamma is the left-to-right tilt in degrees, where right is positive
                var xTilt = e.gamma;
                // beta is the front-to-back tilt in degrees, where front is positive
                var yTilt = e.beta;
                // alpha is the compass direction the device is facing in degrees
                var rot = e.alpha

                var data = { id: id, xAcc : xTilt, yAcc : yTilt };
                socket.emit('phone tilt', data);
            }, false);
        }
        me.loop();
    },
    loop: function(){
        requestAnimationFrame(this.loop.bind(this));
        this.update();
        this.render();
    },
    setInput: function(data){
        this.xTap = data.pageX-this.offset.left;
        this.yTap = data.pageY-this.offset.top;
    },
    updateGameLoop: function(){
        var me = this;
        me.touchType = "boom";
    },
    update: function(){
        switch(this.state){
            case "START":
                this.readyButton.update();
                break;
            case "GAME":
                this.updateGameLoop();
                break;
            case "END":
                break;
        }
    },
    renderStart: function(){
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
        me.ctx.restore();
        me.text(me.ctx,"ready",me.canvas.width/2,me.canvas.height/2,40,me.color);
    },
    renderGame: function(){
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
        me.ctx.restore();
        me.text(me.ctx,"game",me.canvas.width/2,me.canvas.height/2,40,me.color);
    },
    render: function(){
        switch(this.state){
            case "START":
                this.renderStart();
                this.readyButton.render();
                break;
            case "GAME":
                this.renderGame();
                break;
            case "END":
                break;
        }
    },
    text: function(ctx, string, x, y, size, col) {
        ctx.save();
        ctx.font = size+'px BAAAAALLLLLLLLLLS';
        ctx.textAlign = "center";
        ctx.fillStyle = col;
        ctx.fillText(string, x, y);
        ctx.restore();
    },
}