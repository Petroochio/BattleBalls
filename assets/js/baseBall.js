//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Ball = function() {
  var Ball = function(id, color, x, y) {
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
    this.maxCharge = 170;
    this.coolDown = 0;
    this.stunned = false;
    this.stunTime = 0;
    this.dashTime = 0;
    this.dashSpeed = 1;
    this.collisions = [];
    this.KOed = false;
    this.ready = false;
  };

  var b = Ball.prototype;

  b.update = function(dt) {
    this.updateCollisions();
    this.updateCharge(dt);
    this.updateStun(dt);
    this.calculateVelocity(dt);
    this.move(dt);
  };

  b.beginCharge = function(type) {
    if(!this.stunned && !this.charging) {
      this.charging = (this.coolDown <= 0);
      this.chargeType = type;
    }
  };

  b.updateStun = function(dt) {
    if(this.stunned)
      this.stunTime--;
    this.stunned = !(this.stunTime <= 0);
  };

  b.updateCharge = function(dt) {
    if(this.charging)
      this.charge++;
    else
      this.coolDown--;

    if(this.charge >= this.maxCharge)
       this.endCharge();
  };

  b.endCharge = function() {
    if(this.charging && this.charge < this.maxCharge) {
      //2 references to global game obj, fix this
      if(this.chargeType === "moveA")
        this.doMoveA();
      else if(this.chargeType === "moveB")
        this.doMoveB();

    } else if(this.charging) {
      //this.stunned = true;
      this.stunTime = 200;
      this.charge = 0;
      this.charging = false;
      this.coolDown = 20;
    }
  };

  b.doMoveA = function() {
    //filled out in extended class
  };

  b.doMoveB = function() {
    //filled out in extended class
  };

  b.updateCollisions = function() {
    var self = this;
    this.collisions.forEach(function(ball, index, array){
      if(!game.physicsUtils.circleCollision(ball.player, self))
        array.splice(index, 1);
    });
  };
  /** Sets player positon
   * @param x : new x coord
   * @param y : new y coord
   */
  b.setPosition = function(x,y) {
    this.x = x;
    this.y = y;
  };

  b.colliding = function(player) {
    var collide = false;
    this.collisions.forEach(function(ball){
      if(ball.player === player)
        collide = true;
    });
    return collide;
  };

  b.calculateVelocity = function(dt) {
    this.applyFriction();
    this.velocity.x += this.xAcc;
    this.velocity.y += this.yAcc;
  };

  b.updateAcceleration = function(x,y) {
    this.xAcc = x;
    this.yAcc = y;
  };

  b.applyFriction = function() {
    this.velocity.x = this.velocity.x * this.mu;
    this.velocity.y = this.velocity.y * this.mu;
  };

  b.move = function(dt) {
    var scale = 1;
    scale = (this.charging || this.stunned) ? 0.5 : scale;
    this.y += this.velocity.y * scale;
    this.x += this.velocity.x * scale;
  };

  b.applyImpulse = function(impulse) {
    this.velocity.x += impulse.x/this.mass;
    this.velocity.y += impulse.y/this.mass;
  };

  b.render = function(ctx) {
    //filled out in extended class
  };

  b.renderCharge = function(ctx) {
    if(this.chargeType === "moveA")
      this.drawMoveA(ctx);
    else if(this.chargeType === "moveB")
      this.drawMoveB(ctx);
  };

  b.drawMoveA = function(ctx) {
    
  };
  
  b.drawMoveB = function(ctx) {
    
  };

  return Ball;
}();