//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};
//we will need to give the balls individual mass, but for now im gonna use ten
game.physicsUtils = {
  sq : function(val) {
    return val * val;
  },

  circleCollision : function(c1, c2) {
    var radSq = this.sq(c1.radius+ c2.radius);
    var distSq = this.sq(c2.x - c1.x) + this.sq(c2.y - c1.y);
    return (radSq >= distSq);
  },

  getSlope : function(p1, p2) {
    var slope = {};
    slope.x = p2.x - p1.x;
    slope.y = p2.y - p1.y;
    slope.m = slope.y / slope.x;
    return slope;
  },

  getPerp : function(slope) {
    var s2 = {};
    s2.x = slope.x;
    s2.y = -slope.y;
    s2.m = s2.y/s2.x;
    return s2;
  },

  vecDiff : function(v1, v2) {
    var diff = {};
    diff.x = v1.x - v2.x;
    diff.y = v1.y - v2.y;
    return diff;
  },

  normalize : function(vec) {
    var norm = {x: vec.x, y: vec.y};
    var mag = this.getMag(norm);
    norm.x = norm.x/mag;
    norm.y = norm.y/mag;
    return norm;
  },

  vecDot : function(v1, v2) {
    var dot = v1.x * v2.x + v1.y * v2.y;
    return dot;
  },

  getMag : function(vec) {
    return Math.sqrt(this.sq(vec.x) + this.sq(vec.y));
  },

  getImpulse : function(c1, c2) {
    var impact = {};
    impact.x = c2.velocity.x - c1.velocity.x;
    impact.y = c2.velocity.y - c1.velocity.y;

    var impulse = this.normalize(this.vecDiff(c2.velocity, c1.velocity));
    var impactSpeed = this.vecDot(impact, impulse);
    var force = Math.sqrt(impactSpeed * c1.mass * c2.mass);

    impulse.x = impulse.x * force * 1.5;
    impulse.y = impulse.y * force * 1.5;
    return impulse;
  }
}