/*

Note the mapping for sending keydown and keyup is as follows:

		keydown		keyup
Up 		0			4	
Down 	1			5
Left 	2			6
Right	3			7

*/

function Connect()
{
	this.stateQueue = {};
	this.tickQueue = {};
	this.stateChange = false;

	this.socket = io( 'http://localhost:8888' );

	this.socket.on( 'connect', function ()
	{
		this.socket.emit( 'init', name );

		this.socket.on( 'init', connectHandler.bind( this ) );
		this.socket.on( 'disconnect', disconnectHandler );
		this.socket.on( 'e', eventHandler.bind( this ) );
	}.bind( this ) );

	// Attempt different servers if failed to connect to this one
	this.socket.on( 'connect_error', function ()
	{
		if ( this.socket.io.uri === 'http://localhost:8888' )
			this.socket.io.uri = 'http://104.236.222.105:8888';
		else
			this.socket.io.uri = 'http://localhost:8888';
	}.bind( this ) );

	this.setListeners();
}

// Add an event to the queue to be sent to the server
Connect.prototype.pushStateEvent = function ( key, data )
{
	this.stateQueue[ key ] = data;
	if ( map )
		this.tickQueue[ key ] = map.ticker;
	this.stateChange = true;
};

// Send the queue of events to the server
Connect.prototype.sendStateQueue = function ()
{
	if ( !this.stateChange )
		return false;

	this.socket.emit( 'e', this.stateQueue );

	this.stateQueue = {};
	this.stateChange = false;
};

Connect.prototype.setListeners = function ()
{
	window.onbeforeunload = function ()
	{
		if ( this.socket )
			this.socket.close();
	};
};

function connectHandler( data )
{
	// Create a map
	map = new Map( data.boundX, data.boundY );
	map.addWallBorders();

	// Delete a previously stored user object
	if ( user ) delete map.players[ user.id ];

	// Create a new user
	map.players[ data.id ] = user = new User( data.id, data.pos.x, data.pos.y );
	user.addCamera( window.innerWidth, window.innerHeight );
	user.camera.translate( user.pos.x, user.pos.y, map.width, map.height );

	// Create new players
	for ( var id in data.players )
	{
		var player = data.players[ id ];
		map.players[ id ] = new Player( id, player.pos.x, player.pos.y, player.angle );
	}

	// Create map walls
	for ( var id in data.walls )
	{
		var wall = data.walls[ id ];
		map.walls.push( new Wall( wall.pos.x, wall.pos.y, wall.width, wall.height ) );
	}

	animate();
}

function disconnectHandler()
{
	user = undefined;
	map = undefined;
}

function eventHandler( changeQueue )
{
	playerLoop: for ( var id in changeQueue )
	{
		var player = map.players[ id ],
			playerChanges = changeQueue[ id ];

		// Create a new player if their id is not found in players
		if ( !( id in map.players ) && 'pos' in playerChanges )
			player = map.players[ id ] = new Player( id, playerChanges.pos.x, playerChanges.pos.y );

		// Check leaderboard before skipping over user
		if ( 'leaderboard' in playerChanges )
		{
			leaderboard = playerChanges.leaderboard;
			drawLeaderboard();
		}

		if ( 'pos' in playerChanges )
		{
			player.setPos( playerChanges.pos.x, playerChanges.pos.y );
		}

		if ( 'projectiles' in playerChanges )
		{
			player.shoot( map.projectiles );
		}

		// Skip over the user
		if ( id === user.id )
			continue;

		// Disconnect a player and don't do anything else
		if ( 'disconnect' in playerChanges )
		{
			delete map.players[ id ];
			continue playerLoop;
		}

		if ( 'heading' in playerChanges )
		{
			player.barrel.setAngle( playerChanges.heading );
		}

		if ( 'speed' in playerChanges )
		{
			player.setVelocity( playerChanges.speed );
		}

		if ( 'angleSpeed' in playerChanges )
		{
			player.angle.speed = playerChanges.angleSpeed;
		}

		if ( 'angle' in playerChanges )
		{
			player.setAngle( playerChanges.angle, true );
		}

		if ( 'shot' in playerChanges )
		{
			var victim = playerChanges.shot.who;
			player.score = playerChanges.shot.score;
			if ( victim in players )
			{
				players[ victim ].score = 0;
				players[ victim ].setPos( playerChanges.shot.pos.x, playerChanges.shot.pos.y );
			}

		}

		if ( 'hit' in playerChanges )
		{
			var murderer = playerChanges.hit.who;
			player.score = 0;
			player.setPos( playerChanges.hit.pos.x, playerChanges.hit.pos.y );
			if ( murderer in players )
			{
				players[ murderer ].score = playerChanges.hit.score;
			}
		}
	}
}