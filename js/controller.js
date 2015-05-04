"use strict";
var game = game || {};

game.controller = {
    canvas: undefined,
    ctx: undefined,
    state: "START",
    color: undefined,
    ready: false,
    touchType: undefined,
    touching: undefined,
    xTap: undefined,
    yTap: undefined,
    readyButton: undefined,
    
    //Will eventually be replaced with power1Button&power2Button
    boomButton: undefined,
    dashButton: undefined,

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
                me.readyButton.player = id;
                me.boomButton.player = id;
                me.dashButton.player = id;
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
        
        me.touching = false;
        
        //Event listeners
        me.canvas.addEventListener("touchstart", function(e){
            me.touching = true;
            //console.log(me.state);
            me.setInput(e);
            switch(me.state){
                case "START":
                case "END":
                    break;
                case "GAME":
                    me.setTouchType();
                    //var data = { id: id, type: me.touchType };
                    //socket.emit('charge start', data);
                    break;
            }
        });
        
        me.canvas.addEventListener("touchmove", function(e){
            me.setInput(e);
        });
        
        me.canvas.addEventListener("touchend", function(e){
            me.touching = false;
            switch(me.state){
                case "START":
                case "END":
                    socket.emit('player ready', {id : id});
                    me.ready = !me.ready;
                    break;
                case "GAME":
                    //console.log(me.touchType);
                    //var data = { id: id, type: me.touchType }
                    //socket.emit('charge end', data);
                    break;
            }
        });

        me.readyButton = new game.Button(me.ctx,me.canvas.width/2,me.canvas.height/2,me.canvas.width/3,"ready",id,this.color);
        me.boomButton = new game.Button(me.ctx,me.canvas.width/2,me.canvas.height/4,me.canvas.width/4,"boom",id,this.color);
        me.dashButton = new game.Button(me.ctx,me.canvas.width/2,(me.canvas.height/4)*3,me.canvas.width/4,"dash",id,this.color);

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
    setTouchType: function(){
        var me = this;
        if(me.boomButton.currentlyPressed) 
        {
            me.touchType = me.boomButton.id;
        }
        else if(me.dashButton.currentlyPressed) 
        {
            me.touchType = me.dashButton.id;
        }
        
        else
        {
            me.touchType = undefined;
        }
    },
    setInput: function(data){
        this.xTap = data.touches[0].pageX;
        this.yTap = data.touches[0].pageY;
    },
    updateStartScreen: function(){
        this.readyButton.update();
    },
    updateGameLoop: function(){
        var me = this;
        me.boomButton.update();
        me.dashButton.update();
        me.setTouchType();
    },
    update: function(){
        if(this.touching)
        {
            //console.log("X: " + this.xTap + ", Y: " + this.yTap);
        }
        switch(this.state){
            case "START":
                this.updateStartScreen();
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
        me.readyButton.render();
        me.ctx.restore();
    },
    renderGame: function(){
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
        me.ctx.restore();
        me.boomButton.render();
        me.dashButton.render();
    },
    render: function(){
        switch(this.state){
            case "START":
                this.renderStart();
                break;
            case "GAME":
                this.renderGame();
                break;
            case "END":
                break;
        }
    }
}