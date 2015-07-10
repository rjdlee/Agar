var Player = require( './playerRef' ),
	Map = require( './mapRef' );

var boundX = 1300,
	boundY = 800,

	map = new Map( boundX, boundY ),

	// Track player events
	stateQueue = {},

	// Top murderers
	leaderboard = [];

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

	io.on( 'connection', function ( socket )
	{
		( playerConnectHandler.bind( socket ) )();

		socket.on( 'disconnect', playerDisconnectHandler.bind( socket ) );
		socket.on( 'e', playerEventHandler.bind( socket ) );
	} );

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
			playerLog.projectiles = player.shoot( map );
		}

		if ( 'key' in e )
		{
			var key = parseInt( e.key, 10 ),
				speed,
				angleSpeed;

			if ( isNaN( key ) )
				return;

			if ( key === 0 )
				speed = player.setSpeed( 1.5 );
			else if ( key === 1 )
				speed = player.setSpeed( -1.5 );
			else if ( key === 2 )
				angleSpeed = player.setAngleSpeed( -0.05 );
			else if ( key === 3 )
				angleSpeed = player.setAngleSpeed( 0.05 );
			else if ( key === 4 || key === 5 )
				speed = player.setSpeed( 0 );
			else if ( key === 6 || key === 7 )
				angleSpeed = player.setAngleSpeed( 0 );

			if ( typeof speed !== 'undefined' )
				playerLog.speed = speed;
			else if ( typeof angleSpeed !== 'undefined' )
				playerLog.angleSpeed = angleSpeed;
		}

		stateQueue[ id ] = playerLog;
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

			boundX: boundX,
			boundY: boundY,
			leaderboard: leaderboard
		} );

		this.on( 'init', function ( data )
		{
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
		var id = this.id;

		// Overwrite the existing stateQueue object since all other actions are cancelled
		map.removePlayer( id );
		stateQueue[ id ] = {
			disconnect: 0
		};

		console.log( id + ' disconnected.' );
	}
};