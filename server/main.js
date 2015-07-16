/*

Main server loop

*/

var Player = require( '../common/player' ),
	Map = require( '../common/map' ),
	Scoreboard = require( './scoreboard' ),
	Color = require( '../common/color' ),
	BISON = require( '../common/bison' ),
	IDEventQueue = require( '../common/queue' ),
	cfg = require( '../common/config' ),

	avatar = new( require( '../common/avatar' ) )();

var boundX = cfg.map.width,
	boundY = cfg.map.height,

	map = new Map( boundX, boundY ),

	// Track player events
	stateQueue = new IDEventQueue(),

	// Top murderers
	scoreboard = new Scoreboard();

module.exports = function ( io )
{
	animate();

	function animate()
	{
		setInterval( nextTick, cfg.tick_clock );
	}

	var sendClock = 0,
		cellClock = 0;

	function nextTick()
	{
		map.nextTick();

		cellClock++;
		if ( cellClock >= 10 )
		{
			cellClock = 0;

			map.spawnVirus();
			map.spawnFood();

			for ( var id in map.players )
			{
				var player = map.players[ id ],
					cellQueue = [];

				for ( var i in player.cells )
				{
					var cell = player.cells[ i ];
					cellQueue.push( cell.toObject() );
				}

				stateQueue.add( id, 'cell', cellQueue );
			}
		}

		if ( 'f' in map.stateQueue.events )
		{
			for ( var i in map.stateQueue.events.f )
			{
				var e = map.stateQueue.events.f[ i ];
				if ( e[ 1 ] === 'del' )
					stateQueue.add( 'f', e[ 0 ], 'd' );
				else if ( e[ 0 ] < map.food.length )
					stateQueue.add( 'f', e[ 0 ], map.food[ e[ 0 ] ].toObject() );
			}
		}

		if ( 'v' in map.stateQueue.events )
		{
			for ( var i in map.stateQueue.events.v )
			{
				var e = map.stateQueue.events.v[ i ];
				if ( e[ 1 ] === 'del' )
					stateQueue.add( 'v', e[ 0 ], 'd' );
				else if ( e[ 0 ] < map.viruses.length )
					stateQueue.add( 'v', e[ 0 ], map.viruses[ e[ 0 ] ].toObject() );
			}
		}

		map.stateQueue.clear();

		sendClock++;
		if ( sendClock >= 3 )
		{
			sendClock = 0;
			stateQueue.send( io.sockets );
		}
	}

	io.on( 'connection', function ( socket )
	{
		socket.on( 'play', connectEventHandler.bind( socket ) );
		socket.on( 'disconnect', disconnectEventHandler.bind( socket ) );
		socket.on( 'e', eventQueueHandler.bind( socket ) );
	} );
};

function connectEventHandler( data )
{
	var id = this.id,
		player = map.spawnPlayer( id, false );

	// Set either a player texture or a randomly generate hue value
	player.name = data;
	player.texture = data in avatar ? avatar[ data ] : Math.round( 360 * Math.random() );

	// Add all the player data to the logs
	stateQueue.add( id, 'connect', [ player.pos, player.name, player.texture ] );

	// Get the client up to date with its id, pos, and the other players
	this.emit( 'play', BISON.encode(
	{
		players: map.players,
		viruses: map.viruses,
		food: map.food,

		boundX: boundX,
		boundY: boundY,
		leaderboard: scoreboard.getLeaderboard()
	} ) );

	console.log( id + ' connected.' );
}

function disconnectEventHandler()
{
	var id = this.id;

	// Add a disconnect event to the logs
	stateQueue.add( id, 'disconnect' );

	// If the player was on the leaderboard, remove them from it
	if ( scoreboard.remove( id ) <= 10 )
		playerLog.leaderboard = scoreboard.getLeaderboard();

	// Remove the player from the map
	map.remove( 'player', id );

	console.log( id + ' disconnected.' );
}

function eventQueueHandler( e )
{
	var data = BISON.decode( e );
	data.forEach( eventHandler.bind( this ) );
}

function eventHandler( data )
{
	if ( !( this.id in map.players ) )
		return;

	if ( data[ 0 ] === 'toPos' )
		return toPosEventHandler( data, this.id );

	if ( data[ 0 ] === 'shoot' )
		return shootEventHandler( this.id );

	if ( data[ 0 ] === 'split' )
		return splitEventHandler( this.id );
}

function toPosEventHandler( data, id )
{
	var player = map.players[ id ];
	player.setToPos( data[ 1 ].x, data[ 1 ].y );
}

function shootEventHandler( id )
{
	var player = map.players[ id ];
	player.shoot( map );
}

function splitEventHandler( id )
{
	var player = map.players[ id ];
	player.split( map );
}