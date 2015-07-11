/*

Describes tank bullets with constant velocity
Extends: Rectangle

*/

function Projectile( pid, x, y, angle, speed )
{
	// Extend the Rectangle class
	Rectangle.call( this,
	{
		pos:
		{
			x: x,
			y: y
		},
		width: 5,
		height: 2.5,
		transform:
		{
			angle: angle
		}
	} );

	this.id = Math.random().toString();

	// Player who shot this projectile's id
	this.pid = pid || '';

	this.speed = speed || -3;
	this.velocity = {
		x: this.speed * Math.cos( angle ),
		y: this.speed * Math.sin( angle )
	};

	this.bounceCount = 0;
}

Projectile.prototype = Object.create( Rectangle.prototype );
Projectile.prototype.constructor = Projectile;

// Bounce off an unrotated rectangle or map boundary
Projectile.prototype.bounce = function ( edge )
{
	// Return if the projectile has bounced more than once
	if ( this.bounceCount > 0 )
		return false;

	this.bounceCount++;

	if ( edge.x !== 0 )
	{
		this.setAngle( -this.angle.rad );
	}
	else
	{
		if ( this.angle.rad < 0 )
			this.setAngle( -Math.PI - this.angle.rad );
		else
			this.setAngle( Math.PI - this.angle.rad );
	}

	return true;
};

// Move along velocity and check for map boundary, wall, and player collisions. 
Projectile.prototype.translate = function ( map )
{
	// Move with either the same velocity or a reversed velocity from colliding
	this.movePos( this.velocity.x, this.velocity.y );

	// Check for a collision with map boundaries or walls
	// var unitVector = this.isRectangleCollision( map.walls ) || this.isRectangleCollision( map.projectiles );
	var unitVector = this.isRectangleCollision( map.walls ) || this.isRectangleCollision( map.projectiles );
	if ( unitVector && ( !( unitVector[ 2 ] in map.projectiles ) || map.projectiles[ unitVector[ 2 ] ].id !== this.id ) )
	{
		this.movePos( -this.velocity.x, -this.velocity.y );
		if ( !this.bounce( unitVector[ 0 ] ) )
			return true;

		this.movePos( this.velocity.x, this.velocity.y );
	}

	// Bullet collide with tanks
	for ( var id in map.players )
	{
		if ( this.isRotatedRectangleCollision( map.players[ id ] ) )
			return id;
	}
};

// Translate and draw bounding box
Projectile.prototype.tick = function ( map )
{
	var collision = this.translate( map );
	if ( collision )
	{
		map.removeProjectile( this.id );

		if ( collision in map.players )
		{
			// The user object has a key attribute, but the player does not.
			// Only send the event if the user is hit
			if ( 'key' in map.players[ collision ] )
				connect.pushStateEvent( 'hit', this.pid );
		}
	}
};

// Translate and draw bounding box
Projectile.prototype.draw = function ( context, camera )
{
	this.drawBoundingBox( context, camera.pos.x, camera.pos.y );
};