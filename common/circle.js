/*

A circle with movement and collision detection

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( '../common/vector' );

	module.exports = Circle;
}

// Efficient approximation for the square root of a and b
function sqrtApprox( a, b )
{
	// https://stackoverflow.com/questions/3506404/fast-hypotenuse-algorithm-for-embedded-processor
	return 4142 * Math.abs( a ) / 10000 + Math.abs( b );
}

function Circle( x, y, mass )
{
	this.pos = new Vector( x, y );

	this.mass = mass;
	this.radius = Math.floor( Math.sqrt( mass * 30 ) );

	this.direction = new Vector( 0, 0 );
	this.velocity = new Vector( 0, 0 );
	this.projectedVelocity = new Vector( 0, 0 );
	this.acceleration = new Vector( 0, 0 );
}

// Set mass and adjust radius and velocity accordingly
Circle.prototype.setMass = function ( mass )
{
	this.mass = mass;
	this.radius = Math.floor( Math.sqrt( mass * 30 ) );

	var factor = 100 / this.radius;
	this.velocity.set( this.direction.x * factor, this.direction.y * factor );
};

// Move by the velocity projected onto the unit vector 
Circle.prototype.projectVelocity = function ( unitVector )
{
	var dotProduct = this.velocity.dotProduct( unitVector );
	this.projectedVelocity.set( dotProduct * unitVector.x, dotProduct * unitVector.y );
};

// Approximate a collision between circles
Circle.prototype.isNearCollision = function ( circle, radius )
{
	if ( !radius )
		radius = this.radius + circle.radius;

	var deltaPos = circle.pos.diff( this.pos );
	if ( Math.abs( deltaPos.x ) < radius && Math.abs( deltaPos.y ) < radius )
		return true;

	return false;
};

// Exact collision detection with circle
Circle.prototype.isRadiusCollision = function ( circle, radius )
{
	// If no radius, use the combinaed radii plus a bit more
	if ( !radius )
		radius = this.radius + circle.radius;

	// Find the point of collision relative to this circle
	var deltaPos = circle.pos.diff( this.pos );
	if ( deltaPos.length() <= Math.pow( radius, 2 ) )
	{
		var radiusRatio = this.radius / radius;
		return new Vector( radiusRatio * deltaPos.x, radiusRatio * deltaPos.y );
	}

	return false;
};


/*

Object manipulation and cleanup

*/


// Delete this object
Circle.prototype.delete = function ()
{
	if ( this.dom )
		this.dom.delete();
};

// Draw a bounding box to canvas
Circle.prototype.drawBoundingBox = function ( context, offsetX, offsetY )
{
	var x = Math.round( this.pos.x - offsetX ),
		y = Math.round( this.pos.y - offsetY );

	context.moveTo( x + this.radius, y );
	context.arc( x, y, this.radius, 0, 6.283, false );
};


/*

Frontend rendering

*/


// Hex color or an image url
Circle.prototype.initDOM = function ( parent, texture, text )
{
	var x = Math.round( this.pos.x ),
		y = Math.round( this.pos.y ),
		length = this.radius << 1;

	this.dom = new DOMElement( x, y, length, length, 'div', 'circle', parent, text );

	if ( !texture )
		return;

	// Determine if texture is a hue value
	if ( !isNaN( parseFloat( texture ) ) && isFinite( texture ) )
		this.dom.color( texture );
	else
		this.dom.img( texture );
};

// Draw the circle to the DOM, use after running initDOM
Circle.prototype.drawDOM = function ( parent, offsetX, offsetY, name )
{
	var x = Math.round( this.pos.x - offsetX - this.radius ),
		y = Math.round( this.pos.y - offsetY - this.radius ),
		length = this.radius << 1;

	this.dom.draw( x, y, length, length );
};