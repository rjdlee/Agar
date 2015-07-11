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
			this.socket.io.uri = 'http://tankti.me:8888';
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

	for ( var id in data.projectiles )
	{
		var projectile = data.projectiles[ id ];
		projectiles.push( new Projectile( projectile.pid, projectile.pos.x, projectile.pos.y, projectile.angle.rad, projectile.speed ) );
	}

	drawLeaderboard( user.id, data.leaderboard );

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
			drawLeaderboard( user.id, playerChanges.leaderboard );
		}

		if ( 'pos' in playerChanges )
		{
			if ( id === user.id )
			{
				if ( Math.pow( playerChanges.pos.x - player.pos.x, 2 ) + Math.pow( playerChanges.pos.y - player.pos.y, 2 ) > 30 )
					player.setPos( playerChanges.pos.x, playerChanges.pos.y );
				player.camera.translate( player.pos.x, player.pos.y, map.width, map.height );
			}
			else
				player.setPos( playerChanges.pos.x, playerChanges.pos.y );
		}

		if ( 'projectile' in playerChanges )
		{
			var projectileRef = playerChanges.projectile,
				projectile = new Projectile( id, projectileRef.pos.x, projectileRef.pos.y, projectileRef.angle, 0 );

			projectile.velocity = projectileRef.velocity;

			player.projectiles.push( projectile );
			map.projectiles[ projectile.id ] = projectile;
		}

		if ( 'score' in playerChanges )
		{
			player.score = playerChanges.score;

			if ( id === user.id )
				drawScore( player.score );
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

		if ( 'angle' in playerChanges )
		{
			player.setAngle( playerChanges.angle, true );
		}
	}
}