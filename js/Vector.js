"use strict";

function Vector(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

Vector.prototype.x = null;
Vector.prototype.y = null;
Vector.prototype.z = null;

/** Returns the new vector that is this vector plus the v vector. */
Vector.prototype.plus = function(v) {
	return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
};

/** Returns the new vector that is this vector minus the v vector. */
Vector.prototype.minus = function(v) {
	return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
};

Vector.prototype.lenSq = function() {
	return this.x*this.x + this.y*this.y + this.z*this.z;
};

Vector.prototype.len = function() {
	return Math.sqrt(this.lenSq());
};

Vector.prototype.perpendicular = function() {
	return new Vector(-this.y, this.x, this.z);
};

Vector.prototype.scale = function(s) {
	return new Vector(this.x * s, this.y * s, this.z * s);
};

/**
 * Constructs and returns a unit vector in the same direction as this
 * vector.
 */
Vector.prototype.norm = function() {
	return this.scale(1.0/this.len());
};

Vector.prototype.toArray = function(){
	return [this.x, this.y, this.z];
};

/**
 * Returns the vector that is the cross product of this vector and the v
 * vector. Note that the resulting vector is perpendicular to both this and
 * the v vector.
 */
Vector.prototype.crossProduct = function(v){
	return new Vector(
		(this.y * v.z) - (this.z * v.y),
		(this.z * v.x) - (this.x * v.z),
		(this.x * v.y) - (this.y * v.x));
};

/**
 * Returns the cosine of the angle between this vector and the v vector.
 */
Vector.prototype.cosTheta = function(v) {
	return (this.x * v.x + this.y * v.y + this.z * v.z) / this.len() / v.len();
}

/**
 * Returns the float that is the dot product of this vector and the v
 * vector.
 */
Vector.prototype.dotProduct = function(v) {
	return x * v.x + y * v.y + z * v.z;
};


