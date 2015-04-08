//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Player = function() {
  var Player = function(id, color, x, y) {
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
    this.charging = false;
    this.chargeType = undefined;
    this.charge = 0;
    this.maxCharge = 120;
    this.coolDown = 0;
    this.stunned = false;
    this.stunTime = 0;
    this.dashTime = 0;
    this.dashSpeed = 1;
    this.collisions = [];
  }

  var p = Player.prototype;

  p.update = function(dt) {
    this.updateCollisions();
    this.updateCharge(dt);
    this.updateStun(dt);
    this.calculateVelocity(dt);
    this.move(dt);
  };

  p.beginCharge = function(type) {
    if(!this.stunned && !this.charging) {
      this.charging = (this.coolDown <= 0);
      this.chargeType = "boom";
    }
  };

  p.updateStun = function(dt) {
    if(this.stunned)
      this.stunTime--;
    this.stunned = !(this.stunTime <= 0);
  };

  p.updateCharge = function(dt) {
    if(this.charging)
      this.charge++;
    else
      this.coolDown--;

    if(this.charge >= this.maxCharge)
       this.endCharge();
  };

  p.endCharge = function() {
    if(this.charging && this.charge < this.maxCharge) {
      //2 references to global game obj, fix this
      if(this.chargeType === "boom")
        this.doBoom();
      else if(this.chargeType === "dash")
        this.doDash();

    } else if(this.charging) {
      //this.stunned = true;
      this.stunTime = 200;
      this.charge = 0;
      this.charging = false;
      this.coolDown = 20;
    }
  };

  p.doBoom = function() {
    var boom = new game.Boom(this.id, this, this.charge/(this.maxCharge/4) + .25);
    game.battleBalls.booms.push(boom);
    this.charge = 0;
    this.charging = false;
    this.coolDown = 20;
  };

  p.doDash = function() {
    var aX = this.xAcc * this.charge/maxCharge * 10;
    var aY = this.yAcc * this.charge/maxCharge * 10;
    this.updateAcceleration(aX, aY);
    this.charge = 0;
    this.charging = false;
    this.coolDown = 20;
  };
  /*
  p.startDash = function() {
    this.dashTime = this.charge/maxCharge * 2;
    this.
  };

  p.updateDash = function(dt) {
    this.dashTime--;
    if(this.dashTime <= 0)
      this.endDash();
  };

  p.endDash = function() {
    this.
  };
  */
  p.updateCollisions = function() {
    var self = this;
    this.collisions.forEach(function(ball, index, array){
      console.log(ball);
      if(!game.physicsUtils.circleCollision(ball.player, self))
        array.splice(index, 1);
      // else
      //   self.applyImpulse(ball.force);
    });
  };

  p.colliding = function(player) {
    var collide = false;
    this.collisions.forEach(function(ball){
      if(ball.player === player)
        collide = true;
    });
    return collide;
  };

  p.calculateVelocity = function(dt) {
    this.applyFriction();
    this.velocity.x += this.xAcc;
    this.velocity.y += this.yAcc;
  };

  p.updateAcceleration = function(x,y) {
    this.xAcc = x;
    this.yAcc = y;
  };

  p.applyFriction = function() {
    this.velocity.x = this.velocity.x * this.mu;
    this.velocity.y = this.velocity.y * this.mu;
  };

  p.move = function(dt) {
    var scale = 1;
    scale = (this.charging || this.stunned) ? 0.5 : scale;
    this.y += this.velocity.y * scale;
    this.x += this.velocity.x * scale;
  };

  p.applyImpulse = function(impulse) {
    this.velocity.x += impulse.x/this.mass;
    this.velocity.y += impulse.y/this.mass;
  };

  p.render = function(ctx) {
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

  p.renderCharge = function(ctx) {
    if(this.chargeType === "boom")
      this.drawBoomCharge(ctx);
    else if(this.chargeType === "dash")
      this.drawDashCharge(ctx);
  };

  p.drawBoomCharge = function(ctx) {
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
  
  p.drawDashCharge = function(ctx) {
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
    ctx.lineTo(this.x + forward.x * this.charge/this.maxCharge * 10,
              this.y + forward.y * this.charge/this.maxCharge * 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  return Player;
}();