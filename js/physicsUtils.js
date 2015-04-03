//Physics library used for all physics calculations
"use strict";
var game = game || {};

game.physicsUtils = {
  /**Square function, returns the value passed in squared
   * @param val : value to be squared
   */
  sq : function(val) {
    return val * val;
  },
  /** Checks for a collision between two circles
   * @param c1 : first circle in collision check
   * @param c2 : second circle in collision check
   */
  circleCollision : function(c1, c2) {
    var radSq = this.sq(c1.radius+ c2.radius);
    var distSq = this.sq(c2.x - c1.x) + this.sq(c2.y - c1.y);
    return (radSq >= distSq);
  },
  /** Returns a slope, and the x and y components of a 
   *  line between the two points passed in
   * @param p1 : first point
   * @param p2 : second point
   */
  getSlope : function(p1, p2) {
    var slope = {};
    slope.x = p2.x - p1.x;
    slope.y = p2.y - p1.y;
    slope.m = slope.y / slope.x;
    return slope;
  },

  getPerp : function(slope) {
    var s2 = {};
    s2.m = -1/slope.m;
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

  getImpulse : function(c1, c2, scale) {
    var impact = {};
    impact.x = c2.velocity.x - c1.velocity.x;
    impact.y = c2.velocity.y - c1.velocity.y;
    var impulse = this.normalize(this.vecDiff(c2.velocity, c1.velocity));
    var impactSpeed = this.vecDot(impact, impulse);
    var force = Math.sqrt(impactSpeed * c1.mass * c2.mass);

    impulse.x = impulse.x * force * scale;
    impulse.y = impulse.y * force * scale;
    return impulse;
  }
}