"use strict";
var game = game || {};

game.controller = {
    canvas: undefined,
    ctx: undefined,
    state: "JOIN",
    color: undefined,
    ready: false,
    touchType: undefined,
    touching: undefined,
    xTap: undefined,
    yTap: undefined,
    readyButton: undefined,

    //Will eventually be replaced with power1Button&power2Button
    power1Button: undefined,
    power2Button: undefined,
    leftButton: undefined,
    rightButton: undefined,
    
    room: undefined,
    selectedClass: undefined,
    classIndex: 0,
    numOfClasses: 4,

    account: undefined,

    init: function(){
        //initialize variables
        var me = this;
        me.canvas = document.querySelector("#myCanvas");
        me.ctx = me.canvas.getContext("2d");
        
        me.selectedClass = "newbie";

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
        ////////////////////
        //FORMS
        ////////////////////
        //ROOM JOIN
        var join = document.getElementById("join");
        join.onsubmit= function(e){ e.preventDefault();};
        var joinButton = document.getElementById("joinButton");
        var codeField = document.querySelector("#code");
        var errorDiv = document.querySelector("#error")
        errorDiv.style.display = "none";

        joinButton.addEventListener("click", function(){
            var roomID = codeField.value;
            roomID = roomID.toUpperCase();
            me.room = roomID;

            console.log(roomID);

            var validInput = me.validateRoom(roomID);

            if(validInput == true)
            {
                var connectData = { 
                    id: id, 
                    color: me.color, 
                    room: roomID, 
                    name: me.account.username
                };
                socket.emit('player join', connectData);//ADD ROOM TO DATA
            }
            else{
                codeField.value = "";
            }
        });
        //SIGN IN
        var signIn = document.getElementById("sign-in");
        var signUp = document.getElementById("sign-up");
        signIn.onsubmit= function(e){ e.preventDefault();};
        var loginButton = document.getElementById("loginButton");
        var createButton = document.getElementById("createButton");
        var nameField = document.querySelector("#usernameL");
        var passField = document.querySelector("#passwordL");
        var errorLoginDiv = document.querySelector("#error-login")
        errorLoginDiv.style.display = "none";

        loginButton.addEventListener("click", function(){
            if(!nameField.value || !passField.value){
                //error code
                console.log('error sign in');
                var error = "Error: All feilds must be filled out";
                errorLoginDiv.innerHTML = "<p>" + error + "</p>";
                errorLoginDiv.style.display = "block";
            }else {
                var data = {
                    name:nameField.value,
                    pass:passField.value
                }
                socket.emit('account login', data);
            }
        });
        createButton.addEventListener("click", function(){
            signIn.classList.toggle("hidden");
            signUp.classList.toggle("hidden");
        });
        //SIGN UP
        signUp.onsubmit= function(e){ e.preventDefault();};
        var confirmButton = document.getElementById("confirmButton");
        var nameCreateField = document.querySelector("#usernameC");
        var pass1Field = document.querySelector("#password1");
        var pass2Field = document.querySelector("#password2");
        var errorCreateDiv = document.querySelector("#error-create")
        errorCreateDiv.style.display = "none";

        confirmButton.addEventListener("click", function(){
            console.log('click');
            if(!nameCreateField.value || !pass1Field.value || !pass2Field.value){
                //error code
                console.log('error sign up');
                var error = "Error: All feilds must be filled out";
                errorCreateDiv.innerHTML = "<p>" + error + "</p>";
                errorCreateDiv.style.display = "block";
            } else {
                var data = {
                    name:nameCreateField.value,
                    pass:pass1Field.value,
                    pass2:pass2Field.value
                }
                socket.emit('account create', data);
            }
        });
        ///////////////////////////
        //SOCKET EVENT FOR SIGN IN
        ///////////////////////////
        socket.on('login success', function(data){
            console.log(data);
            me.account = data.account;
            signIn.classList.add("hidden");
            signUp.classList.add("hidden");
            join.classList.remove("hidden");
        });
        socket.on('sing-up err', function(data){
            var error = "Error: Account unavailable";
            errorCreateDiv.innerHTML = "<p>" + error + "</p>";
            errorCreateDiv.style.display = "block";
        });
        socket.on('login err', function(data){
            var error = "Error: Invalid sign in data";
            errorLoginDiv.innerHTML = "<p>" + error + "</p>";
            errorLoginDiv.style.display = "block";
        });
        ///////////////////////////
        /*var connectData = { id: id, color: me.color };

        socket.emit('player join', connectData);//ADD ROOM TO DATA*/

        socket.on('player connect', function(data){
            if(data.id !== -1) {
                id = data.id;
                me.readyButton.player = id;
                me.power1Button.player = id;
                me.power2Button.player = id;
                me.state = "START";
                
                document.getElementById("join").style.display = "none";
                //document.getElementById("ballSelect").style.display = "block";
//                codeField.style.display = "none";
//                joinButton.style.display = "none";
                me.canvas.style.display = "block";
                errorDiv.style.display = "none";
            }
            else{
                var error = "Error: Room Not Found";
                errorDiv.innerHTML = "<p>" + error + "</p>";
                errorDiv.style.display = "block";
            }
        });

        socket.on('state change', function(data){
            if(data.state === "END") {
                me.state = "START";
                //document.getElementById("ballSelect").style.display = "block";
            }else if(data.state === "GAME") {
                document.getElementById("ballSelect").style.display = "none";
                me.setButtonNames();
                me.state = "GAME";
                me.ready = false;
            }
        });
        
        socket.on('select class', function(data){
                me.setButtonNames();
            });
        
        /*socket.on('player ready', function(data){
            me.power1Button.id = me.power1Button.player.power1Name;
            me.power2Button.id = me.power2Button.player.power2Name;
        });*/

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
                    //socket.emit('player ready', {id : id, room: me.room});//ADD ROOM CODE
                    //me.ready = !me.ready;
                    break;
                case "GAME":
                    //console.log(me.touchType);
                    //var data = { id: id, type: me.touchType }
                    //socket.emit('charge end', data);
                    break;
            }
        });

        me.readyButton = new game.Button(me.ctx,me.canvas.width/2,me.canvas.height/6*5,me.canvas.width/6,"ready",id, me);
        me.leftButton = new game.Button(me.ctx,me.canvas.width/4,me.canvas.height/2,me.canvas.width/8,"<",id, me);
        me.rightButton = new game.Button(me.ctx,3 * me.canvas.width/4,me.canvas.height/2,me.canvas.width/8,">",id, me);
        
        me.power1Button = new game.Button(me.ctx,me.canvas.width/2,me.canvas.height/4,me.canvas.width/4,undefined,id, me);
        me.power2Button = new game.Button(me.ctx,me.canvas.width/2,(me.canvas.height/4)*3,me.canvas.width/4,undefined, id, me);
        

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function(e) {
                // gamma is the left-to-right tilt in degrees, where right is positive
                var xTilt = e.gamma;
                // beta is the front-to-back tilt in degrees, where front is positive
                var yTilt = e.beta;
                // alpha is the compass direction the device is facing in degrees
                var rot = e.alpha

                var data = { id: id, xAcc : xTilt, yAcc : yTilt, room: me.room };//ADD ROOM
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
        if(me.power1Button.currentlyPressed) 
        {
            me.touchType = me.power1Button.id;
        }
        else if(me.power2Button.currentlyPressed) 
        {
            me.touchType = me.power2Button.id;
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
        this.leftButton.update();
        this.rightButton.update();
        this.readyButton.update();
    },
    updateGameLoop: function(){
        var me = this;
        me.power1Button.update();
        me.power2Button.update();
        me.setTouchType();
    },
    update: function(){
        switch(this.state){
            case "JOIN":
                break;
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
        game.DrawLib.drawText(me.ctx, me.selectedClass, me.canvas.width/2, me.canvas.height/3, 40, me.color);
        this.leftButton.render();
        this.rightButton.render();
        me.readyButton.render();
        me.ctx.restore();
    },
    renderGame: function(){
        var me = this;
        me.ctx.save();
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
        me.ctx.restore();
        me.power1Button.render();
        me.power2Button.render();
    },
    render: function(){
        switch(this.state){
            case "JOIN":
                break;
            case "START":
                this.renderStart();
                break;
            case "GAME":
                this.renderGame();
                break;
            case "END":
                break;
        }
    },

    //check if the code for the room is valid
    validateRoom: function(id){
        var valid = false;
        var errorDiv = document.querySelector("#error");
        if(id.length < 4) //ID is 
        {
            var error = "Error: Code too short";
            errorDiv.innerHTML = "<p>" + error + "</p>";
            errorDiv.style.display = "block";
        }
        else
        {
            if(id.match(/^[A-Z]+$/))
            {
                console.log("Valid code");
                valid = true;
            }
            else
            {
                var error = "Error: Invalid code";
                errorDiv.innerHTML = "<p>" + error + "</p>";
                errorDiv.style.display = "block";
            }
        }

        return valid;
    },
    
    setButtonNames: function(){
        //this.power1Button.id = this.selectedClass.power1Name;
        //this.power2Button.id = this.selectedClass.power2Name;
        switch(this.selectedClass){
            case "newbie":
                this.power1Button.id = "boom";
                this.power2Button.id = "dash";
                break;
            case "speed":
                this.power1Button.id = "brake";
                this.power2Button.id = "sling";
                break;
            case "matador":
                this.power1Button.id = "dodge";
                this.power2Button.id = "rush";
                break;
            case "ghost":
                this.power1Button.id = "tele";
                this.power2Button.id = "scare";
                break;       
        }             
    },
    
    selectClass: function(indexChange){
        this.classIndex += indexChange;
        
        if(this.classIndex === this.numOfClasses)
        {
            this.classIndex = 0;
        }
        else if(this.classIndex === -1)
        {
            this.classIndex = this.numOfClasses - 1;
        }
        
        switch(this.classIndex)
        {
            case 0:
                this.selectedClass = "newbie";
                break;
            case 1:
                this.selectedClass = "speed";
                break;
            case 2:
                this.selectedClass = "matador";
                break;
            case 3:
                this.selectedClass = "ghost";
                break;
        }
    }
}