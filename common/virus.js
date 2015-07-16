/*

A spiky virus that pops cells

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( './vector' ),
		Circle = require( './circle' ),
		cfg = require( './config' );

	module.exports = Virus;
}

function Virus( x, y )
{
	Circle.call( this, x, y, cfg.virus.mass );
}

Virus.prototype = Object.create( Circle.prototype );
Virus.prototype.constructor = Virus;

Virus.prototype.tick = function ( map )
{
	if ( Math.abs( this.velocity.x ) <= 0.5 && Math.abs( this.velocity.y ) <= 0.5 )
		return false;

	this.velocity.set( this.velocity.x + this.acceleration.x, this.velocity.y + this.acceleration.y );
	this.pos.add( this.velocity.x, this.velocity.y );

	return true;
};

Virus.prototype.feed = function ( direction, mass, map )
{
	this.setMass( this.mass + mass );

	if ( this.mass > cfg.virus.min_split_mass )
	{
		this.split( direction, map );
	}
};

Virus.prototype.split = function ( direction, map )
{
	this.setMass( cfg.virus.mass );

	var sibling = map.spawnVirus( this.pos.x, this.pos.y );
	sibling.velocity.set( direction.x * 5, direction.y * 5 );
	sibling.acceleration.set( direction.x / -10, direction.y / -10 );

	return sibling;
};


/*

Object manipulation and cleanup

*/


// Returns [ position, velocity ]
Virus.prototype.toObject = function ()
{
	var virusObj = [ this.pos.toObject(), this.mass ],
		velocityObj = this.velocity.toObject(),
		accelerationObj = this.acceleration.toObject();

	if ( Object.keys( velocityObj ).length > 0 )
		virusObj.push( velocityObj );

	if ( Object.keys( accelerationObj ).length > 0 )
		virusObj.push( accelerationObj );

	return virusObj;
};


/*

Frontend rendering

*/


Virus.prototype.draw = function ( context, offsetX, offsetY )
{
	var length = this.radius << 1;

	context.save();
	context.translate( this.pos.x - offsetX, this.pos.y - offsetY )
	context.moveTo( this.radius, this.radius );

	for ( var i = 0; i < 5; i++ )
	{
		context.rotate( Math.PI / 5 );
		context.rect( -this.radius, -this.radius, length, length );
	}

	context.restore();
};