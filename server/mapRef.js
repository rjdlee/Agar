var fs = require( 'fs' ),
	vm = require( 'vm' ),
	Wall = require( './wallRef' ),
	Noise = require( './noise' )();

include( '../common/rectangle.js' );
include( '../common/map.js' );

function include( path )
{
	var code = fs.readFileSync( path, 'utf-8' );
	vm.runInThisContext( code, path );
}

function MapRef( width, height )
{
	this.ref = {
		width: width,
		height: height,

		walls: [],

		players: new Object(),
		playersRef: new Object()
	};

	this.grid;
	this.tileSize = 50;

	Map.call( this, width, height );

	this.generateMap();
	this.generateWalls();
	this.renderWalls();
}

MapRef.prototype = Object.create( Map.prototype );
MapRef.prototype.constructor = MapRef;

// Override the Map tick function to add grid functionality
MapRef.prototype.tick = function ()
{
	// Draw the players
	for ( var i in this.players )
	{
		var player = this.players[ i ];
		// player.tick( this );
		// this.updateGridPos( player, 3 );
	}

	// Draw projectiles and check for collisions
	for ( var i in this.projectiles )
	{
		var projectile = this.projectiles[ i ];
		projectile.tick( this );
		// this.updateGridPos( projectile, 4 );
	}

	this.ticker++;
};

Map.prototype.updateGridPos = function ( object, id )
{
	var x = Math.floor( object.pos.x / this.tileSize ),
		y = Math.floor( object.pos.y / this.tileSize );

	if ( !( 'gridPos' in object ) )
		object.gridPos = {
			x: x,
			y: y
		};
	// No change in grid position
	else if ( object.gridPos.y === y && object.gridPos.x === x )
		return false;

	if ( object.gridPos.x < 0 || object.gridPos.x > this.width || object.gridPos.y < 0 || object.gridPos.y > this.height )
		return false;

	this.grid[ object.gridPos.y ][ object.gridPos.x ] = 0;

	if ( x < 0 || x > this.width || y < 0 || y > this.height )
		return false;

	this.grid[ y ][ x ] = id;

	object.gridPos.x = x;
	object.gridPos.y = y;
};

Map.prototype.placePlayer = function ( player )
{
	if ( !player )
		return false;

	var tries = 0;
	tryLoop: while ( tries < 10 )
	{
		var posY = Math.ceil( Math.random() * ( this.grid.length - 4 ) ) + 2,
			posX = Math.ceil( Math.random() * ( this.grid[ posY ].length - 4 ) ) + 2;

		for ( var y = -1; y < 2; y++ )
		{
			for ( var x = -1; x < 2; x++ )
			{
				if ( this.grid[ posY + y ][ posX + x ] !== 0 )
					continue tryLoop;
			}
		}

		player.setPos( posX * this.tileSize, posY * this.tileSize );
		player.gridPos.x = posX;
		player.gridPos.y = posY;
		player.ref.pos = player.pos;
		player.translateBoundingBox();

		this.grid[ y ][ x ] = 3;

		return player.pos;

		tries++;
	}

	return false;
};

Map.prototype.generateMap = function ()
{
	var gridSize = this.tileSize,
		gridWidth = Math.floor( this.width / gridSize ),
		gridHeight = Math.floor( this.height / gridSize ),
		grid = new Array( gridHeight ),
		wallTiles = [],

		threshold = 0;

	Noise.seed( Math.random() );

	// Initial grid pass to populate with simplex noise
	for ( var y = 0; y < gridHeight; y++ )
	{
		var row = new Array( gridWidth );
		grid[ y ] = row;

		for ( var x = 0; x < gridWidth; x++ )
		{
			// Do not place walls next to the map borders
			if ( y === 0 || y === gridHeight - 1 || x === 0 || x === gridWidth - 1 )
			{
				row[ x ] = 0;
				continue;
			}

			if ( y > 0 && grid[ y - 1 ][ x ] )
			{
				threshold = 0;
			}

			if ( Noise.simplex2( x, y ) > threshold )
			{
				row[ x ] = 1;
				threshold = 0;

				wallTiles.push(
				{
					x: x,
					y: y
				} );

				if ( y > 0 && grid[ y - 1 ][ x ] )
				{
					threshold = 0.6;
				}

				continue;
			}

			row[ x ] = 0;
			threshold = 0.6;
		}
	}

	// Replace diagonal walls by adding in corner tiles
	for ( var i in wallTiles )
	{
		var tile = wallTiles[ i ];

		// Example: X - -
		//			- i -
		//			- - -
		// Fill in the point right above i
		for ( var y = -1; y < 2; y += 2 )
		{
			for ( var x = -1; x < 2; x += 2 )
			{
				if ( grid[ tile.y + y ][ tile.x + x ] )
				{
					if ( grid[ tile.y ][ tile.x + x ] )
						continue;

					if ( grid[ tile.y + y ][ tile.x ] )
						continue;

					grid[ tile.y + y ][ tile.x ] = 1;
					wallTiles.push(
					{
						x: x,
						y: tile.y + y
					} );
				}
			}
		}
	}

	this.grid = grid;
	this.wallTiles = wallTiles;
};

Map.prototype.generateWalls = function ()
{
	var wallTiles = this.wallTiles,
		grid = this.grid,
		walls = [];

	this.walls = walls;

	for ( var i = wallTiles.length - 1; i >= 0; i-- )
	{
		var tile = wallTiles[ i ],
			wall = [
				{
					x: tile.x,
					y: tile.y
				},
				{
					x: tile.x,
					y: tile.y
				}
			],
			vertical = false;

		if ( grid[ tile.y ][ tile.x ] !== 1 )
			continue;

		walls.push( wall );
		grid[ tile.y ][ tile.x ] = 2;

		for ( var direction = -1; direction < 2; direction += 2 )
		{
			var offset = direction;

			while ( true )
			{
				if ( grid[ tile.y + offset ][ tile.x ] )
				{
					if ( direction === -1 )
						wall[ 0 ].y += direction;
					else
						wall[ 1 ].y += direction;

					grid[ tile.y + offset ][ tile.x ] = 2;
					offset += direction;
					vertical = true;
				}
				else
				{
					break;
				}
			}
		}

		if ( vertical )
			continue;

		for ( var direction = -1; direction < 2; direction += 2 )
		{
			var offset = direction;

			while ( true )
			{
				if ( grid[ tile.y ][ tile.x + offset ] )
				{
					if ( direction === -1 )
						wall[ 0 ].x += direction;
					else
						wall[ 1 ].x += direction;

					grid[ tile.y ][ tile.x + offset ] = 2;
					offset += direction;
				}
				else
				{
					break;
				}
			}
		}
	}
};

Map.prototype.renderWalls = function ()
{
	var walls = this.walls;

	for ( var i = walls.length - 1; i >= 0; i-- )
	{
		var wall = this.walls[ i ],
			wallWidth = Math.max( wall[ 1 ].x - wall[ 0 ].x, 1 ) * 50,
			wallHeight = Math.max( wall[ 1 ].y - wall[ 0 ].y, 1 ) * 50;

		this.walls[ i ] = new Wall( wall[ 0 ].x * 50 - wallWidth / 2, wall[ 0 ].y * 50 - wallHeight / 2, wallWidth, wallHeight );
		this.ref.walls.push( this.walls[ i ].ref );
	}
}

// Extract a digit from a random seed, digit starts at 1
function getSeedDigit( seed, digit )
{
	digit = Math.pow( 10, digit );
	return Math.round( ( seed * digit ) % 10 );
}

module.exports = function ( width, height )
{
	return new MapRef( width, height );
};