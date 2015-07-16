// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( './vector' ),
		Food = require( './food' ),
		Virus = require( './virus' ),
		Cell = require( './cell' ),
		Player = require( './player' ),
		IDEventQueue = require( './queue' );

	module.exports = Map;
}

function Map( width, height )
{
	this.tick = 0;

	this.width = width;
	this.height = height;

	this.players = {};
	this.cells = [];
	this.viruses = [];
	this.food = [];

	this.stateQueue = new IDEventQueue();

	// A grid contains players, viruses, and food, but tile is just for the grid background
	this.tileSize = 20;

	// this.quadtree = new Quadtree( 0, 0, width, height, 0 );
}

Map.prototype.draw = function ( foodContext, foodCanvas, virusContext, virusCanvas, gridCanvas, camera )
{
	gridCanvas.style.left = foodCanvas.style.left = virusCanvas.style.left = -Math.round( camera.pos.x ) + 'px';
	gridCanvas.style.top = foodCanvas.style.top = virusCanvas.style.top = -Math.round( camera.pos.y ) + 'px';

	// if ( camera.zoom !== 1 )
	// canvas.style.transform = gridCanvas.style.transform = foodCanvas.style.transform = virusCanvas.style.transform = 'scale(' + camera.zoom + ')';

	if ( 'c' in this.stateQueue.events )
	{
		for ( var i in this.stateQueue.events.c )
		{
			var cell = this.cells[ this.stateQueue.events.c[ i ][ 0 ] ],
				player = this.players[ cell.player ];

			cell.initDOM( cellCanvas, player.texture, player.name );
		}
	}

	for ( var i in this.players )
	{
		this.players[ i ].drawDOM( cellCanvas, camera.pos.x, camera.pos.y );
	}

	// Draw the foods
	if ( 'f' in this.stateQueue.events )
	{
		foodContext.clearRect( 0, 0, this.width, this.height );
		foodContext.beginPath();

		for ( var i in this.food )
		{
			this.food[ i ].draw( foodContext, 0, 0 );
		}

		foodContext.stroke();
		foodContext.fill();
	}

	// Draw the viruses
	if ( 'v' in this.stateQueue.events )
	{
		virusContext.clearRect( 0, 0, this.width, this.height );
		virusContext.beginPath();

		for ( var i in this.viruses )
		{
			this.viruses[ i ].draw( virusContext, 0, 0 );
		}

		virusContext.stroke();
		virusContext.fill();
	}

	this.stateQueue.clear();
};

Map.prototype.nextTick = function ()
{
	// Draw the players
	for ( var i in this.players )
	{
		this.players[ i ].nextTick( this );
	}

	for ( var i in this.food )
	{
		if ( this.food[ i ].tick( this, i ) )
			this.isFoodChange = true;
	}

	for ( var i in this.viruses )
	{
		if ( this.viruses[ i ].tick( this ) )
			this.isVirusChange = true;
	}

	this.tick++;
};

Map.prototype.nextTickNoCollision = function ()
{
	// Draw the players
	for ( var i in this.players )
	{
		this.players[ i ].nextTickNoCollision( this );
	}

	for ( var i in this.food )
	{
		if ( this.food[ i ].tick( this, i ) )
			this.stateQueue.add( 'f', i, 'move' );
	}

	for ( var i in this.viruses )
	{
		if ( this.viruses[ i ].tick( this ) )
			this.stateQueue.add( 'v', i, 'move' );
	}

	this.tick++;
};

// Generate a random position somewhere on the map
Map.prototype.randomPos = function ()
{
	return new Vector(
		Math.round( Math.random() * this.width ),
		Math.round( Math.random() * this.height )
	);
};

// Spawns a circle object in a random place where there are no collisions
Map.prototype.randomlyPlace = function ( circle )
{
	placementLoop: while ( true )
	{
		circle.pos = this.randomPos();

		for ( var id in this.players )
		{
			if ( circle.isRadiusCollision( this.players[ id ] ) )
				continue placementLoop;
		}

		for ( var id in this.viruses )
		{
			if ( circle.isRadiusCollision( this.viruses[ id ] ) )
			{
				continue placementLoop;
			}
		}

		return circle;
	}
};

// Spawn and return a virus at (x, y) if they are passed or in a random location
Map.prototype.spawnVirus = function ( x, y )
{
	var virus

	if ( x && y )
	{
		virus = new Virus( x, y );
	}
	else
	{
		// Don't spawn more than 10 viruses
		if ( this.viruses.length > 10 )
			return;

		if ( Math.random() > 0.5 )
		{
			// Create a virus with a random position
			var virus = new Virus( 0, 0 );
			this.randomlyPlace( virus );
		}
	}

	if ( typeof virus !== 'undefined' )
	{
		// this.quadtree.insert( virus );
		this.viruses.push( virus );
		this.lastVirusTick = this.ticker;
		this.stateQueue.add( 'v', this.viruses.length - 1, virus.pos );
	}

	return virus;
};

// Spawn and return a food at (x, y) if they are passed or in a random location
Map.prototype.spawnFood = function ( x, y )
{
	var food;

	if ( x && y )
	{
		food = new Food( x, y );
	}
	else
	{
		// Don't spawn more than 100 foods
		if ( this.food.length > 10 )
			return;

		// Create a food with a random position
		if ( Math.random() > 0.5 )
		{
			var pos = this.randomPos();
			food = new Food( pos.x, pos.y );
		}
	}

	if ( typeof food !== 'undefined' )
	{
		// this.quadtree.insert( food );
		this.food.push( food );
		this.stateQueue.add( 'f', this.food.length - 1, food.pos );
	}

	return food;
};

// Spawn a player or a controller at (x, y) with id
Map.prototype.spawnPlayer = function ( id, isController, x, y )
{
	var player;

	// Create either a User or Player
	if ( isController )
		player = new Controller( x, y, id );
	else
		player = new Player( x, y, id );

	player.cells.push( this.spawnCell( x, y, 100, id ) );

	// Place the player randomly if their position wasn't passed
	if ( typeof x === 'undefined' || typeof y === 'undefined' )
	{
		var cell = player.cells[ 0 ];

		this.randomlyPlace( cell );
		player.pos.set( cell.pos.x, cell.pos.y );
	}

	// Delete an existing player with the same ID
	if ( player.id in this.players )
		this.remove( 'player', player.id );

	// Add the player to the list
	this.players[ player.id ] = player;
	this.stateQueue.add( 'p', id, player.pos );

	return player;
};

// Spawn and return a cell at (x, y) with mass
Map.prototype.spawnCell = function ( x, y, mass, playerID )
{
	var cell = new Cell( x, y, mass, playerID, this.tick );

	// this.quadtree.insert( cell );
	this.cells.push( cell );
	this.stateQueue.add( 'c', this.cells.length - 1, cell.pos );

	return cell;
};

// Clone an object containing player information
Map.prototype.clonePlayer = function ( playerObj, isController )
{
	var player = this.spawnPlayer( playerObj.id, isController, playerObj.pos.x, playerObj.pos.y );

	if ( playerObj.name )
		player.name = playerObj.name;

	if ( playerObj.mass )
		player.mass = playerObj.mass;

	if ( playerObj.toPos )
		player.toPos.set( playerObj.toPos );

	// Clone the player object cells
	player.cells = [];
	for ( var i = 0; i < playerObj.cells.length; i++ )
		player.cells.push( this.cloneCell( playerObj.cells[ i ] ) );

	// Set the player texture if there is a cellCanvas
	if ( typeof window !== 'undefined' )
		player.initDOM( cellCanvas, playerObj.texture );

	return player;
};

// Clone an object containing cell information
Map.prototype.cloneCell = function ( cellObj )
{
	var cell = this.spawnCell( cellObj.pos.x, cellObj.pos.y, cellObj.mass, cellObj.player );

	if ( cellObj.rejoinTick )
		cell.rejoinTick = cellObj.rejoinTick;

	if ( cellObj.direction )
		cell.direction.set( cellObj.direction.x, cellObj.direction.y );

	if ( cellObj.velocity )
		cell.velocity.set( cellObj.velocity.x, cellObj.velocity.y );

	return cell;
};

// Remove food, virus, or player from the map
Map.prototype.remove = function ( type, index )
{
	if ( type === 'food' )
	{
		if ( index >= this.food.length )
			return;

		this.food.splice( index, 1 );
		this.stateQueue.add( 'f', index, 'del' );
	}
	else if ( type === 'virus' )
	{
		if ( index >= this.viruses.length )
			return;

		this.viruses.splice( index, 1 );
		this.stateQueue.add( 'v', index, 'del' );
	}
	else if ( type === 'player' )
	{
		if ( !( index in this.players ) )
			return;

		for ( var i in this.players[ index ].cells )
		{
			if ( this.players[ index ].cells[ i ].dom )
				this.players[ index ].cells[ i ].dom.delete();
		}

		delete this.players[ index ];
		this.stateQueue.add( 'p', index, 'del' );
	}
};

// Clear the entire map of everything
Map.prototype.clear = function ()
{
	for ( var id in this.players )
		this.remove( 'player', id );

	this.cells = [];
	this.viruses = [];
	this.food = [];
	this.stateQueue.clear();
};

// Draw a background grid for the map
Map.prototype.drawGrid = function ( width, height, gridContext )
{
	gridContext.beginPath();

	// Top, bottom borders
	gridContext.rect( -100, -100, width + 100, 100 );
	gridContext.rect( -100, height, width + 100, 100 );

	// Left, Right borders
	gridContext.rect( -100, 100, 100, height + 100 );
	gridContext.rect( width, 100, 100, height + 100 );

	gridContext.fill();
	gridContext.beginPath();

	for ( var x = 0; x <= Math.ceil( width / this.tileSize ); x++ )
	{
		gridContext.moveTo( x * this.tileSize, 0 );
		gridContext.lineTo( x * this.tileSize, height );
	}

	for ( var y = 0; y <= Math.ceil( height / this.tileSize ); y++ )
	{
		gridContext.moveTo( 0, y * this.tileSize );
		gridContext.lineTo( width, y * this.tileSize );
	}

	gridContext.stroke();
};