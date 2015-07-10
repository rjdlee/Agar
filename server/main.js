var Player = require( './playerRef' ),
	Map = require( './mapRef' ),
	Scoreboard = require( './scoreboard' );

var boundX = 1300,
	boundY = 800,

	map = new Map( boundX, boundY ),

	// Track player events
	stateQueue = {},

	// Top murderers
	scoreboard = new Scoreboard();

module.exports = function ( io )
{
	init();

	function init()
	{
		setInterval( draw, 1000 / 60 );
	}

	function draw()
	{
		map.tick();
		if ( Object.keys( stateQueue ).length > 0 )
		{
			io.sockets.emit( 'e', stateQueue );
			stateQueue = {};
		}
	}

	io.on( 'connection', function ( socket )
	{
		( playerConnectHandler.bind( socket ) )();

		socket.on( 'disconnect', playerDisconnectHandler.bind( socket ) );
		socket.on( 'e', playerEventHandler.bind( socket ) );
	} );
};

// Record change events
function pushStateEvent( id, key, data )
{
	var playerState = {};
	if ( id in stateQueue )
		playerState = stateQueue[ id ];

	if ( key in playerState )
		playerState[ key ].push( data )
	else
		playerState[ key ] = [ data ];

	stateQueue[ id ] = playerState;
	stateChange = true;
}

function playerConnectHandler()
{
	var id = this.id,
		player = Player( id, 0, 0 ),
		playerLog = id in stateQueue ? stateQueue[ id ] :
		{};

	map.placePlayer( player );

	// Get the client up to date with its id, pos, and the other players
	this.emit( 'init',
	{
		id: this.id,
		pos: player.pos,
		players: map.ref.players,
		walls: map.ref.walls,
		projectiles: map.ref.projectiles,

		boundX: boundX,
		boundY: boundY,
		leaderboard: scoreboard.getLeaderboard()
	} );

	this.on( 'init', function ( data )
	{
		map.players[ id ].name = data;
		map.ref.players[ id ].name = data;
	}.bind( id ) );

	map.players[ id ] = player;
	map.ref.players[ id ] = player.ref;

	playerLog.pos = player.pos;
	stateQueue[ id ] = playerLog;

	console.log( id + ' connected.' );
}

function playerDisconnectHandler()
{
	var id = this.id,
		playerLog = {
			disconnect: 0
		};

	// Remove the rest of the playerLog since the player is gone
	stateQueue[ id ] = {
		disconnect: 0
	};

	// If the player was on the leaderboard, remove them from it
	if ( scoreboard.remove( id ) <= 10 )
		playerLog.leaderboard = scoreboard.getLeaderboard();

	// Remove the player from the map
	map.removePlayer( id );

	console.log( id + ' disconnected.' );
}

function playerEventHandler( e )
{
	var id = this.id,
		playerLog = id in stateQueue ? stateQueue[ id ] : new Object(),
		player = map.players[ id ];

	if ( !player )
		return;

	if ( 'pos' in e )
	{
		player.setPosWarp( e.pos, map );
		playerLog.pos = player.ref.pos;
	}

	if ( 'angle' in e )
	{
		player.setAngle( e.angle );
		playerLog.angle = player.ref.angle;
	}

	if ( 'mousemove' in e )
	{
		player.setHeading( e.mousemove );
		playerLog.heading = player.ref.heading;
	}

	if ( 'mousedown' in e )
	{
		var projectile = player.shoot( map );
		if ( projectile )
		{
			playerLog.projectile = {
				pos: projectile.pos,
				angle: projectile.angle.rad,
				velocity: projectile.velocity
			};
		}
	}

	if ( 'hit' in e )
	{
		var aid = e.hit,
			assailant = map.players[ aid ],
			assailantLog = aid in stateQueue ? stateQueue[ aid ] : new Object();

		// Move the player to a new place
		playerLog.pos = map.placePlayer( player );

		// player loses all their points
		player.score = 0;
		playerLog.score = 0;

		// If assailant isn't player, they earn a point
		if ( aid !== id )
		{
			assailant.score++;
			assailantLog.score = assailant.score;
		}

		// Update the scoreboard with the new scores
		var isPlayerLeaderboard = scoreboard.add( id, 0, player.name ),
			isAssailantLeaderboard = scoreboard.add( aid, assailant.score, assailant.name );

		if ( isPlayerLeaderboard || isAssailantLeaderboard )
			playerLog.leaderboard = scoreboard.getLeaderboard();

		stateQueue[ aid ] = assailantLog;
	}

	stateQueue[ id ] = playerLog;
}