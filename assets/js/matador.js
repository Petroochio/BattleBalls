//Function for making player objects and adding them to the game
"use strict";
var game = game || {};

game.Matador = function() {
  var Matador = function(id, color, x, y, name) {
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
    this.name = name;
      
    this.power1Name = "dodge";
    this.power2Name = "rush";
    this.rushPower = 300;
    this.dodgeSpeed = 200;
    this.maxVelocity = 5;
    this.velocityMag = 0;
  };

  var p = Matador.prototype;

  p.update = function(dt) {
    this.updateCollisions();
    this.updateCharge(dt);
    this.updateStun(dt);
    this.calculateVelocity(dt);
    this.move(dt);
  };

  p.beginCharge = function(type) {
      if(type === "rush")
      {
        if(!this.stunned && !this.charging) {
          this.charging = (this.coolDown <= 0);
          this.chargeType = type;
        }
      }
      else if (type === "dodge")
      {
         this.doDodge(); 
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
      if(this.chargeType === "dodge")
        this.doBoom();
      else if(this.chargeType === "rush")
        this.doRush();

    } else if(this.charging) {
      //this.stunned = true;
      this.stunTime = 200;
      this.charge = 0;
      this.charging = false;
      this.coolDown = 20;
    }
  };

  p.doDodge = function(){
      var forward = {x: 0, y: 0};
      if(this.velocityMag != 0)
      {
        forward = {x:this.velocity.x / this.velocityMag, y: this.velocity.y / this.velocityMag};
      }
    var forwardAngle = Math.atan2(forward.x, forward.y); //calculate the direction the ball is facing
    var sideAngle = forwardAngle + Math.PI/2;
      
    var side = {x: Math.cos(sideAngle) * this.dodgeSpeed, y: Math.sin(sideAngle) * this.dodgeSpeed};
      
    //var sideX = this.xAcc * this.dashSpeed;
    //var aY = this.yAcc * this.dashSpeed;
    //this.updateAcceleration(aX, aY);
      
      if (sideAngle > 0){
                if(sideAngle > Math.PI/2) {
                    // Quadrant II, sin is positive
                    this.velocity.x += side.x;
                    this.velocity.y += (side.y * -1);
                } else {
                    // Quadrant I, both are positve
                    this.velocity.x += (side.x * -1);
                    this.velocity.y += (side.y * -1);
                }
            } else {
                if (sideAngle > -Math.PI/2) {
                    // Quadrant III, neither are positive
                    this.velocity.x += (side.x * -1);
                    this.velocity.y += (side.y * -1);
                } else {
                    // Quadrant IV, cos is positive
                    this.velocity.x += side.x;
                    this.velocity.y += side.y;
                }
            }
    this.velocity.x += side.x;
    this.velocity.y += (side.y * -1);
      
    this.charge = 0;
    this.charging = false;
    this.coolDown = 0;
      game.battleBalls.dashSound.play();
  };

  p.doRush = function() {
    var aX = this.xAcc * this.charge/this.maxCharge * this.rushPower;
    var aY = this.yAcc * this.charge/this.maxCharge * this.rushPower;
    this.updateAcceleration(aX, aY);
    this.charge = 0;
    this.charging = false;
    this.coolDown = 20;
    game.battleBalls.dashSound.play();
  };

  p.updateCollisions = function() {
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
  p.setPosition = function(x,y) {
    this.x = x;
    this.y = y;
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
      
      this.velocityMag = Math.sqrt((this.velocity.x * this.velocity.x) + (this.velocity.y*this.velocity.y));   
      
      if(this.velocityMag > this.maxVelocity)
      {
          this.clampVelocity();
      }
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
    else if(this.chargeType === "rush")
      this.drawRushCharge(ctx);
  };
  
  p.drawRushCharge = function(ctx) {
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
    
    p.clampVelocity = function(){ // prevent the velocity from becoming too high for the player to control
        var normVelocity = {x: this.velocity.x / this.velocityMag, y: this.velocity.y / this.velocityMag};
        var clampedVelocity = {x: normVelocity.x * this.maxVelocity, y: normVelocity.y * this.maxVelocity};
        this.velocity = clampedVelocity;
    };

  return Matador;
}();