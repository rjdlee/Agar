function Map( width, height )
{
	this.ticker = 0;

	this.width = width;
	this.height = height;

	this.walls = [];
	this.projectiles = {};

	this.players = {};

	// Size of tiles
	this.tileSize = 50;
}

// Add walls to the border of the map
Map.prototype.addWallBorders = function ()
{
	var halfWidth = this.width / 2,
		halfHeight = this.height / 2,
		halfTile = this.tileSize / 2;

	// Horizontal walls
	this.walls.push( new Wall( halfWidth, halfTile, this.width, this.tileSize ) );
	this.walls.push( new Wall( halfWidth, this.height - halfTile, this.width, this.tileSize ) );

	// Vertical walls
	this.walls.push( new Wall( halfTile, halfHeight, this.tileSize, this.height ) );
	this.walls.push( new Wall( this.width - halfTile, halfHeight, this.tileSize, this.height ) );
};

Map.prototype.removePlayer = function ( id )
{
	if ( id in this.players )
		delete this.players[ id ];

	if ( 'ref' in this && id in this.ref.players )
		delete this.ref.players[ id ];
};

Map.prototype.removeProjectile = function ( id )
{
	if ( id in this.projectiles )
		delete this.projectiles[ id ];
};

Map.prototype.tick = function ()
{
	// Draw the players
	for ( var i in this.players )
	{
		this.players[ i ].tick( this );
	}

	// Draw projectiles and check for collisions
	for ( var i in this.projectiles )
	{
		this.projectiles[ i ].tick( this );
	}

	this.ticker++;
};

Map.prototype.draw = function ( context, terrainContext, camera )
{
	// Draw the players
	for ( var i in this.players )
	{
		this.players[ i ].draw( context, camera );
	}

	// Draw projectiles and check for collisions
	for ( var i in this.projectiles )
	{
		this.projectiles[ i ].draw( context, camera );
	}

	for ( var i in this.walls )
	{
		this.walls[ i ].draw( terrainContext, camera );
	}
};