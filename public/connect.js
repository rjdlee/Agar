/*
 
Connection with the server over SocketIO
 
 */

function Connect()
{
	this.socket = io( 'http://localhost:6666' );

	this.socket.on( 'connect', function ()
	{
		this.socket.on( 'disconnect', disconnectHandler );
		this.socket.on( 'e', eventQueueHandler.bind( this ) );
	}.bind( this ) );

	this.setListeners();
	errorHandler();
}

Connect.prototype.play = function ()
{
	this.socket.emit( 'play', ui.name );
	this.socket.on( 'play', connectHandler.bind( this ) );
};

// Add a listener to close the socket when the browser window is closed
Connect.prototype.setListeners = function ()
{
	window.onbeforeunload = function ()
	{
		if ( this.socket )
			this.socket.close();
	};
};

// On connect to server, create map and populate it with things
function connectHandler( data )
{
	data = BISON.decode( data );

	// Create a map
	map = new Map( data.boundX, data.boundY );

	// Remove a previous user controller
	if ( user )
		delete map.players[ user.id ];

	// Create new players
	for ( var id in data.players )
	{
		// Create a new user else a player from the playerObj data
		if ( id === this.socket.id )
			user = map.clonePlayer( data.players[ id ], true );
		else
			map.clonePlayer( data.players[ id ], false );
	}

	// Spawn viruses on the map
	for ( var i in data.viruses )
		map.spawnVirus( data.viruses[ i ].pos.x, data.viruses[ i ].pos.y );

	// Spawn food on the map
	for ( var i in data.food )
		map.spawnFood( data.food[ i ].pos.x, data.food[ i ].pos.y );

	// drawLeaderboard( user.id, data.leaderboard );

	init();
}

// On disconnect from server, delete the map
function disconnectHandler()
{

	map.clear();
}

// Handle connection errors to the serve
function errorHandler()
{
	// Attempt different servers if failed to connect to this one
	this.socket.on( 'connect_error', function ()
	{
		if ( this.socket.io.uri === 'http://localhost:6666' )
			this.socket.io.uri = 'http://agar.tankti.me:6666';
		else
			this.socket.io.uri = 'http://localhost:6666';
	}.bind( this ) );
}


/*

Game cycle handlers

*/


// Route to the following three handlers on normal communication
function eventQueueHandler( data )
{
	// Wait for the map to load, then do whatever is in this queue
	if ( !map )
	{
		setTimeout( function ()
		{
			eventQueueHandler( data )
		}, 10 );
		return false;
	}

	data = BISON.decode( data );
	for ( var id in data )
	{
		if ( id === 'v' )
			virusHandler( data.v );
		else if ( id === 'f' )
			foodHandler( data.f );
		else
			eventHandler( data[ id ], id );
	}
}

// Handle virus creation and deletion
function virusHandler( data )
{
	for ( var i in data )
	{
		if ( data[ i ][ 1 ] === 'd' )
			map.remove( 'virus', data[ i ][ 0 ] );
		else
		{
			var e = data[ i ][ 1 ],
				virus = map.spawnVirus( e[ 0 ].x, e[ 0 ].y );

			virus.setMass( e[ 1 ] );

			if ( e.length > 2 )
				virus.velocity.set( e[ 2 ].x, e[ 2 ].y );

			if ( e.length > 3 )
				virus.acceleration.set( e[ 3 ].x, e[ 3 ].y );
		}
	}
}

// Handle food creation and deletion
function foodHandler( data )
{
	for ( var i in data )
	{
		if ( data[ i ][ 1 ] === 'd' )
			map.remove( 'food', data[ i ][ 0 ] );
		else
		{
			var e = data[ i ][ 1 ],
				food = map.spawnFood( e[ 0 ].x, e[ 0 ].y );

			if ( e.length > 1 )
				food.velocity.set( e[ 1 ].x, e[ 1 ].y );

			if ( e.length > 2 )
				food.acceleration.set( e[ 2 ].x, e[ 2 ].y );
		}
	}
}

// Handle player cells and player connections
function eventHandler( data, id )
{
	var player = map.players[ id ];
	for ( var i in data )
	{
		var e = data[ i ];

		// Create a new player if their id is not found in players
		if ( e[ 0 ] === 'connect' && user && id !== user.id )
		{
			player = map.spawnPlayer( id, false, e[ 1 ][ 0 ].x, e[ 1 ][ 0 ].y );
			player.name = e[ 1 ][ 1 ];
			player.texture = e[ 1 ][ 2 ];
			continue;
		}

		if ( !player )
			continue;

		if ( e[ 0 ] === 'disconnect' )
		{
			map.remove( 'player', id );
			break;
		}

		else if ( e[ 0 ] === 'cell' )
		{
			cellHandler( e[ 1 ], player );
		}

		else if ( e[ 0 ] === 'shoot' )
		{
			player.shoot( map );
		}

		else if ( e[ 0 ] === 'split' )
		{
			player.split( map );
		}
	}
}

// Handle cell creation and deletion as well as movement
function cellHandler( data, player )
{
	// Remove any cells that are no longer present
	for ( var i = 1; i <= player.cells.length - data.length; i++ )
		player.removeCell( player.cells.length - i );

	// Iterate through each cell from the event data
	for ( var j in data )
	{
		var cellObj = data[ j ],
			cell = player.cells[ j ];

		if ( !cell )
		{
			cell = map.spawnCell( cellObj[ 0 ].x, cellObj[ 0 ].y, cellObj[ 2 ], player.id );
			player.cells.push( cell );
		}
		else
		{
			cell.setMass( cellObj[ 2 ] );
			cell.deltaPos.set( cellObj[ 0 ].x - cell.pos.x, cellObj[ 0 ].y - cell.pos.y );
		}

		cell.rejoinTick = cellObj[ 3 ];
		cell.velocity.set( cellObj[ 1 ].x, cellObj[ 1 ].y );
	}
}