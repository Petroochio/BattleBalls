//Function for making bubble objects and adding them to the game
"use strict";
var game = game || {};

game.physicsUtils = {
  sq : function(val) {
    return val * val;
  },

  circleCollision : function(c1, c2) {
    var radSq = this.sq(c1.radius) + this.sq(c2.radius);
    var distSq = this.sq(c1.x - c2.x) + this.sq(c1.y - c2.y);
    return (radSq < distSq);
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

  getMag : function(vec) {
    return Math.sqrt(sq(vec.x) + sq(vec.y));
  }

}