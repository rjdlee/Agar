var fs = require( 'fs' ),
	vm = require( 'vm' );

include( '../common/rectangle.js' );
include( '../common/projectile.js' );

function include( path )
{
	var code = fs.readFileSync( path, 'utf-8' );
	vm.runInThisContext( code, path );
}

function ProjectileRef( id, x, y )
{
	this.ref = {
		name: 'Tanky',
		score: 0,

		pos:
		{
			x: x,
			y: y
		},
		velocity: 0
	};

	// Position on the map grid, needs to be initialized manually
	this.gridPos = {
		x: 0,
		y: 0
	};
	this.lastPosTick = 0;

	Projectile.call( this, id, x, y );
}

ProjectileRef.prototype = Object.create( Projectile.prototype );
ProjectileRef.prototype.constructor = ProjectileRef;

module.exports = function ( id, x, y )
{
	return new ProjectileRef( id, x, y );
};