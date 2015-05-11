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
    this.charges = {brake: false, sling: false}
    this.canBrake = true;
    this.canSling = true;
    this.charge = 0;
    this.maxCharge = 170;
    this.brakePower  50;
    this.collisions = [];
    this.target = {x: 0, y:0};
    this.KOed = false;
    this.ready = false;
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
      if(chargeType === 'brake')
        this.charges[type] = this.canBrake;
      else
        this.charges[type] = this.canSling;
    }
  };

  s.updateStun = function(dt) {
    if(this.stunned)
      this.stunTime--;
    this.stunned = !(this.stunTime <= 0);
  };

  s.updateCharge = function(dt) {
    //weird break logic
    this.handleBrakes();
  };

  s.handleBrakes = function(){
    if( this.canBrake && this.charges.brake && this.breakPower > 0 ){
      this.brakePower--;
      this.mu = .5;
    } else {
      this.mu = .95;
      this.endCharge();
    }

    if(this.brakePower < 1)
      this.canBrake = false;

    if(!this.canBrake)
      this.canBrake = (this.brakePower >= 50);
  }

  s.endCharge = function() {
    if(this.charging && this.charge < this.maxCharge) {
      

    } else if(this.charging) {
      //this.stunned = true;
      this.stunTime = 200;
      this.charge = 0;
      this.charging = false;
      this.coolDown = 20;
    }
  };

  s.doBoom = function() {
    var boom = new game.Boom(this.id, this, this.charge/(this.maxCharge/4) + .25);
    game.battleBalls.booms.push(boom);
    this.charge = 0;
    this.charging = false;
    this.coolDown = 20;
      game.battleBalls.boomSound.play();
  };

  s.doDash = function() {
    var aX = this.xAcc * this.charge/this.maxCharge * 200;
    var aY = this.yAcc * this.charge/this.maxCharge * 200;
    this.updateAcceleration(aX, aY);
    this.charge = 0;
    this.charging = false;
    this.coolDown = 20;
      game.battleBalls.dashSound.play();
  };

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
    if(this.charging)
      this.renderCharge(ctx);
  };

  s.renderCharge = function(ctx) {
    if(this.chargeType === "boom")
      this.drawBoomCharge(ctx);
    else if(this.chargeType === "dash")
      this.drawDashCharge(ctx);
  };

  s.drawBoomCharge = function(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, (this.charge / 20) + 3, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };
  
  s.drawDashCharge = function(ctx) {
    var forward = { x: this.velocity.x, y: this.velocity.y };
    forward = game.physicsUtils.normalize(forward);

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur=10;
    ctx.shadowColor=this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + forward.x * (this.charge/this.maxCharge + 0.1)* 10,
              this.y + forward.y * (this.charge/this.maxCharge + 0.1)* 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  return Speed;
}();