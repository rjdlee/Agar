/*

The main body of a tank with collision handling
Extends: Rectangle

*/

function Tank( x, y, angle )
{
	// Extend the Rectangle class
	Rectangle.call( this,
	{
		pos:
		{
			x: x,
			y: y
		},
		width: 50,
		height: 25,
		transform:
		{
			angle: angle || 0
		}
	} );

	this.barrel = new TankBarrel( x, y );
	this.projectiles = [];
}

Tank.prototype = Object.create( Rectangle.prototype );
Tank.prototype.constructor = Tank;

// Sets the tank body and barrel position
Tank.prototype.setPos = function ( x, y )
{
	Rectangle.prototype.setPos.call( this, x, y );
	this.barrel.setPos( x, y );
};

// Moves the tank body and barrel position
Tank.prototype.movePos = function ( x, y )
{
	Rectangle.prototype.movePos.call( this, x, y );
	this.barrel.movePos( x, y );
};

// Translate by current velocity; uses speed and velocity for translation
Tank.prototype.translate = function ( boundX, boundY, walls, players )
{
	// Don't perform any transforms if there is no speed
	if ( !this.speed )
	{
		return false;
	}

	var unitVector = this.isRectangleCollision( walls );
	if ( unitVector )
	{
		unitVector = unitVector[ 0 ];
		// Move by the velocity projected onto the unit vector 
		var dotProduct = this.velocity.x * unitVector.x + this.velocity.y * unitVector.y;
		this.movePos( dotProduct * unitVector.x, dotProduct * unitVector.y );

		return true;
	}

	// Check for collisions with other tanks and cancel velocity in the direction of the tank
	unitVector = this.isTankCollision( players );
	if ( unitVector )
	{
		// Move by the velocity projected onto the unit vector 
		var dotProduct = this.velocity.x * unitVector.x + this.velocity.y * unitVector.y;
		this.movePos( dotProduct * unitVector.x, dotProduct * unitVector.y );

		return true;
	}

	// If no collisions, increment the speed by velocity
	this.movePos( this.velocity.x, this.velocity.y );

	return true;
};

// Convenience method for rotate; uses angle.speed for rotation
Tank.prototype.rotate = function ( boundX, boundY, walls, players )
{
	// Don't perform any transforms if there is no radial velocity
	if ( !this.angle.speed )
		return false;

	// Reset angle when it goes over 2π, otherwise increment it by speed
	if ( Math.abs( this.angle ) >= 6.283185 )
		this.setAngle( 0 );
	else
		this.setAngle( this.angle.rad + this.angle.speed );

	// Rotate off of walls
	var unitVector = this.isRectangleCollision( walls );
	if ( unitVector )
	{
		var displacementVector = {
			x: unitVector[ 1 ] * unitVector[ 0 ].y,
			y: unitVector[ 1 ] * unitVector[ 0 ].x
		};

		if ( unitVector[ 0 ].x < 0 )
			displacementVector.y = -displacementVector.y;

		if ( unitVector[ 0 ].y < 0 )
			displacementVector.x = -displacementVector.x;

		this.movePos( displacementVector.x, displacementVector.y );

		return true;
	}

	// Check for collisions with other tanks and cancel velocity in the direction of the tank
	var unitVector = this.isTankCollision( players );
	if ( unitVector )
	{
		// Shift the position by the tangential velocity projected onto the unit vector
		var tangentialVelocity = this.radius * this.angle.speed;
		this.movePos( tangentialVelocity * unitVector.x, tangentialVelocity * unitVector.y );

		return true;
	}

	return true;
};

// Fire a projectile from the end of barrel and return the reference
Tank.prototype.shoot = function ( projectiles )
{
	this.barrel.rotateBoundingBox();

	var projectile = new Projectile( this.id, this.barrel.boundingBox[ 2 ].x, this.barrel.boundingBox[ 2 ].y, this.barrel.angle.rad );

	projectiles[ projectile.id ] = projectile;
	this.projectiles.push( projectile );

	return projectile;
};

// Returns true if there is a collision between this tank and a tank from players
Tank.prototype.isTankCollision = function ( players )
{
	for ( var id in players )
	{
		// Don't check this tank with itself
		if ( players[ id ].id === this.id )
		{
			continue;
		}

		// Return if a collision is found
		var unitVector = this.isRotatedRectangleCollision( players[ id ] );
		if ( unitVector )
		{
			return unitVector;
		}
	}

	return false;
};