//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Speed = function() {
  var Speed = function(id, color, x, y) {
    this.x = x;
    this.y = y;
    this.xAcc = 0;
    this.yAcc = 0;
    this.velocity = {x: 0, y: 0};
    this.radius = 20;
    this.id = id;
    this.color = color;
    this.mu = 0.95;
    this.mass = 10;
    this.charges = {brake: false, sling: false};
    this.chargesReady = {brake: true, sling: true};
    this.slingTime = 0;
    this.maxCharge = 200;
    this.brakePower =  50;
    this.collisions = [];
    this.target = {x: x, y: y};
    this.KOed = false;
    this.ready = false;
    this.power1Name = "sling";
    this.power2Name = "break";
  };

  var s = Speed.prototype;

  s.update = function(dt) {
    this.updateCollisions();
    this.updateCharge(dt);
    this.updateStun(dt);
    this.calculateVelocity(dt);
    this.move(dt);
  };

  s.beginCharge = function(type) {
    if(!this.stunned && !this.charges[type]) {
      if(type === 'brake')
        this.charges[type] = this.chargesReady.brake;
      else {
        this.charges[type] = this.chargesReady.sling;
        this.target.x = this.x;
        this.target.y = this.y;
      }
    }
  };

  s.updateStun = function(dt) {
    if(this.stunned)
      this.stunTime--;
    this.stunned = !(this.stunTime <= 0);
  };
  //////////////////
  //CLASS SPECIFIC
  //////////////////
  s.updateCharge = function(dt) {
    //weird break logic
    this.handleBrakes();
    this.handleSling();
  };

  s.handleBrakes = function(){
    if(this.chargesReady.brake && this.charges.brake && this.breakPower > 0){
      this.brakePower--;
      this.mu = .5;
    } else {
      this.mu = .95;
      this.endCharge('brake');
    }

    if(this.brakePower < 1)
      this.chargesReady.brake = false

    if(!this.canBrake)
      this.chargesReady.brake = (this.brakePower >= 50);
  }

  s.handleSling = function() {
    if(this.charges.sling)
      this.slingTime ++;
    if(this.slingTime >= this.maxCharge) {
      this.endCharge('sling');
      this.slingCooldown = 100;
    }
    this.slingCooldown--;
    this.chargesReady.sling = (this.slingCooldown < 1);

  };

  s.endCharge = function(type) {
    this.charges[type] = false;
    //send sling
    if(this.type = "sling"){
      //calc distance
      var xDist = this.target.x - this.x;
      var yDist = this.target.y - this.y;
      //apply force
      var impulse = {x:xDist, y:yDist};
      impulse.x /= 2;
      impulse.y /= 2;

      this.applyImpulse(impulse);
      //reset
    }
  };
  /////////////////////////
  //BASE CODE
  /////////////////////////

  s.updateCollisions = function() {
    var self = this;
    this.collisions.forEach(function(ball, index, array){
      if(!game.physicsUtils.circleCollision(ball.player, self))
        array.splice(index, 1);
      // else
      //   self.applyImpulse(ball.force);
    });
  };
  /** Sets player positon
   * @param x : new x coord
   * @param y : new y coord
   */
  s.setPosition = function(x,y) {
    this.x = x;
    this.y = y;
  };

  s.colliding = function(player) {
    var collide = false;
    this.collisions.forEach(function(ball){
      if(ball.player === player)
        collide = true;
    });
    return collide;
  };

  s.calculateVelocity = function(dt) {
    this.applyFriction();
    this.velocity.x += this.xAcc;
    this.velocity.y += this.yAcc;
  };

  s.updateAcceleration = function(x,y) {
    this.xAcc = x;
    this.yAcc = y;
  };

  s.applyFriction = function() {
    this.velocity.x = this.velocity.x * this.mu;
    this.velocity.y = this.velocity.y * this.mu;
  };

  s.move = function(dt) {
    var scale = 1;
    scale = (this.charging || this.stunned) ? 0.5 : scale;
    this.y += this.velocity.y * scale;
    this.x += this.velocity.x * scale;
  };

  s.applyImpulse = function(impulse) {
    this.velocity.x += impulse.x/this.mass;
    this.velocity.y += impulse.y/this.mass;
  };
  ///////////////////
  //RENDER FUNCTIONS
  ///////////////////
  s.render = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.stunned ? 'grey' : this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    //if(this.charging)
    this.renderCharge(ctx);
  };

  s.renderCharge = function(ctx) {
    if(this.charges.sling)
      this.drawSling(ctx);
    else if(this.charges.brake)
      this.drawBrake(ctx);
  };

  s.drawSling = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.arc(this.target.x, this.target.y, 10, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };
  
  s.drawBrake = function(ctx) {
    
  };

  return Speed;
}();