/*

A 1d, 2d, or 3d vector class with helper functions

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	module.exports = Vector;
}

function Vector( x, y, z )
{
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
}

// Set the arguments to its corresponding axis of this vector
Vector.prototype.set = function ( x, y, z )
{
	if ( typeof x === 'undefined' )
		x = 0;

	if ( typeof y === 'undefined' )
		y = 0;

	if ( typeof z === 'undefined' )
		z = 0;

	this.x = x;
	this.y = y;
	this.z = z;
};

// Add the arguments to its corresponding axis of this vector
Vector.prototype.add = function ( x, y, z )
{
	if ( typeof x === 'undefined' )
		x = 0;

	if ( typeof y === 'undefined' )
		y = 0;

	if ( typeof z === 'undefined' )
		z = 0;

	this.x += x;
	this.y += y;
	this.z += z;
};

// Divide each axis of this vector by the divisor
Vector.prototype.divide = function ( divisor )
{
	this.x /= divisor;
	this.y /= divisor;
	this.z /= divisor;
};

// Multiply each axis of this vector by the multiple
Vector.prototype.multiply = function ( multiple )
{
	this.x *= multiple;
	this.y *= multiple;
	this.z *= multiple;
};

// Project this vector onto the vector argument
Vector.prototype.project = function ( vector )
{
	var dotProduct = this.dotProduct( vector );

	this.x *= dotProduct;
	this.y *= dotProduct;
	this.z *= dotProduct;
};


/* Functions below return the result rather than modify contents of this vector */


// Return the unit vector of this vector
Vector.prototype.unitVector = function ()
{
	var length = this.length();

	return new Vector(
		Math.sign( this.x ) * Math.pow( this.x, 2 ) / length,
		Math.sign( this.y ) * Math.pow( this.y, 2 ) / length,
		Math.sign( this.z ) * Math.pow( this.z, 2 ) / length );
};

// Return a vector containing the difference of each axis
Vector.prototype.diff = function ( vector )
{

	return new Vector( this.x - vector.x, this.y - vector.y, this.z - vector.z );
};

// Return the dot product of the two vectors
Vector.prototype.dotProduct = function ( vector )
{

	return this.x * vector.x + this.y * vector.y + this.z * vector.z;
};

// Returns the length of the vector ( note this is the length ^ 2 )
Vector.prototype.length = function ()
{

	return Math.pow( this.x, 2 ) + Math.pow( this.y, 2 ) + Math.pow( this.z, 2 );
};

// Return a copy of this vector
Vector.prototype.clone = function ()
{

	return new Vector( this.x, this.y, this.z );
};

// Returns an object containing each non-zero axis
Vector.prototype.toObject = function ()
{
	var vectorObject = {};

	if ( this.x !== 0 )
		vectorObject.x = this.x;

	if ( this.y !== 0 )
		vectorObject.y = this.y;

	if ( this.z !== 0 )
		vectorObject.z = this.z;

	return vectorObject;
};