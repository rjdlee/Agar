var fs = require( 'fs' ),
	vm = require( 'vm' );

include( '../common/rectangle.js' );
include( '../common/circle.js' );
include( '../common/projectile.js' );
include( '../common/wall.js' );
include( '../common/tankBarrel.js' );
include( '../common/tank.js' );
include( '../common/player.js' );

function include( path )
{
	var code = fs.readFileSync( path, 'utf-8' );
	vm.runInThisContext( code, path );
}

function PlayerRef( id, x, y )
{
	this.ref = {
		name: 'Tanky',
		score: 0,

		pos:
		{
			x: x,
			y: y
		},
		speed: 0,

		// Direction of travel
		angle: 0,
		angleSpeed: 0,

		// Where the barrel is facing
		heading: 0,

		projectiles: [],
		lastProjectile: new Date(),

		shot: new Object(),
		hit: new Object()
	};

	// Position on the map grid, needs to be initialized manually
	this.gridPos = {
		x: 0,
		y: 0
	};
	this.lastPosTick = 0;

	Player.call( this, id, x, y );
}

PlayerRef.prototype = Object.create( Player.prototype );
PlayerRef.prototype.constructor = PlayerRef;

PlayerRef.prototype.setPosWarp = function ( pos, map )
{
	var dPosVector = {
			x: pos.x - this.pos.x,
			y: pos.y - this.pos.y
		},
		dPos = Math.pow( dPosVector.x, 2 ) + Math.pow( dPosVector.y, 2 ),
		dTick = map.ticker - this.lastPosTick,
		dPosSpeed;

	// No time has passed so don't do anything
	if ( dTick === 0 )
		return false;

	// Don't do anything if there is no change in position
	if ( dPos === 0 )
		return false;

	dPosSpeed = dPosSpeed / ( dTick );

	// Use server generated position if the client position seems off
	if ( dPosSpeed > 1.6 )
		return false;

	this.movePos( dPosVector.x, dPosVector.y );
	this.ref.pos = this.pos;
	this.lastPosTick = map.ticker;

	return true;
};

PlayerRef.prototype.setSpeed = function ( speed )
{
	if ( Math.abs( speed ) > 1.5 )
		return false;

	this.setVelocity( speed );
	this.ref.speed = speed;

	return speed;
};

PlayerRef.prototype.setAngle = function ( angle )
{
	Player.prototype.setAngle.call( this, angle );
	this.ref.angle = angle;

	return angle;
};

Player.prototype.setAngleSpeed = function ( speed )
{
	if ( Math.abs( speed ) > 0.1 )
		return false;

	this.angle.speed = speed;
	this.ref.angleSpeed = speed;

	return speed;
};

PlayerRef.prototype.setHeading = function ( angle )
{
	this.barrel.setAngle( angle );
	this.ref.heading = angle;

	return angle;
};

PlayerRef.prototype.shoot = function ( map )
{
	if ( map.ticker - this.lastShotTick < 20 )
		return false;

	this.ref.projectiles = this.projectiles;

	return true;
};

module.exports = function ( id, x, y )
{
	return new PlayerRef( id, x, y );
};