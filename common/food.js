/*

One unit of food
nom nom nom

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( './vector' ),
		Circle = require( './circle' ),
		cfg = require( './config' );

	module.exports = Food;
}

function Food( x, y )
{
	Circle.call( this, x, y, 2 );
}

Food.prototype = Object.create( Circle.prototype );
Food.prototype.constructor = Food;

Food.prototype.tick = function ( map, index )
{
	if ( Math.abs( this.velocity.x ) <= 0.5 && Math.abs( this.velocity.y ) <= 0.5 )
		return false;

	this.velocity.set( this.velocity.x + this.acceleration.x, this.velocity.y + this.acceleration.y );
	this.pos.add( this.velocity.x, this.velocity.y );

	// Determine if the food is colliding with a virus
	for ( var j = 0; j < map.viruses.length; j++ )
	{
		var virus = map.viruses[ j ];

		if ( !this.isRadiusCollision( virus ) )
			continue;

		virus.feed( this.direction, cfg.food.mass, map );
		map.food.splice( index, 1 );

		return true;
	}

	return true;
};


/*

Object manipulation and cleanup

*/


// Returns [ position, velocity ]
Food.prototype.toObject = function ()
{
	var foodObj = [ this.pos.toObject() ],
		velocityObj = this.velocity.toObject(),
		accelerationObj = this.acceleration.toObject();

	if ( Object.keys( velocityObj ).length > 0 )
		foodObj.push( velocityObj );

	if ( Object.keys( accelerationObj ).length > 0 )
		foodObj.push( accelerationObj );

	return foodObj;
};


/*

Frontend rendering

*/


// Draw a circle bounding box
Food.prototype.draw = function ( context, offsetX, offsetY )
{

	this.drawBoundingBox( context, offsetX, offsetY );
};