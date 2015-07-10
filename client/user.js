/*

A user input controlled player which uses keyboard and mouse events
Extends: Player

*/

function User( id, x, y, angle )
{
	// Extend the Rectangle class
	Player.call( this, id, x, y, angle );

	this.camera;
	this.key = {
		up: false,
		down: false,
		left: false,
		right: false
	};

	this.checkListeners();
}

User.prototype = Object.create( Player.prototype );
User.prototype.constructor = User;

User.prototype.addCamera = function ( width, height )
{
	this.camera = new Camera( this.pos.x, this.pos.y, width, height );
};

// Override player relative draw since we can't draw relative to ourself
User.prototype.tick = function ( map )
{
	// Rotate if there is angular sped
	if ( this.rotate( map.width, map.height, map.walls, map.players ) )
	{
		this.camera.translate( this.pos.x, this.pos.y, map.width, map.height );
		connect.pushStateEvent( 'angle', this.angle.rad );
	}

	// Translate if there is speed
	if ( this.translate( map.width, map.height, map.walls, map.players ) )
	{
		this.camera.translate( this.pos.x, this.pos.y, map.width, map.height );
		connect.pushStateEvent( 'pos', this.pos );
	}
};

// Assign listeners for mousemove, mousedown, keydown, and keyup
User.prototype.checkListeners = function ()
{
	document.addEventListener( 'mousemove', mouseMoveListener.bind( this ), false );
	document.addEventListener( 'mousedown', mouseDownListener.bind( this ), false );
	document.addEventListener( 'keydown', keyDownListener.bind( this ), false );
	document.addEventListener( 'keyup', keyUpListener.bind( this ), false );
};

function mouseMoveListener( e )
{
	var lastHeading = this.barrel.angle.rad;

	this.barrel.setPosAngle( e.clientX, e.clientY, this.camera );

	// Only send the event if the change in angle is greater than 0.01
	if ( Math.abs( this.barrel.angle.rad - lastHeading ) > 0.01 )
		connect.pushStateEvent( 'mousemove', this.barrel.angle.rad );
}

function mouseDownListener( map )
{
	connect.pushStateEvent( 'mousedown', this.barrel.angle.rad );
}

// If up is pressed before down, move forward. When up is released, move backwards if down is still pressed.
function keyDownListener( e )
{
	// Forward
	if ( e.keyCode === 38 || e.keyCode === 87 )
	{
		if ( !this.key.down )
		{
			this.setVelocity( 1.5 );
			connect.pushStateEvent( 'key', 0 );
		}

		this.key.up = true;
	}

	// Backward
	if ( e.keyCode === 40 || e.keyCode === 83 )
	{
		if ( !this.key.up )
		{
			this.setVelocity( -1.5 );
			connect.pushStateEvent( 'key', 1 );
		}

		this.key.down = true;
	}

	// Left
	if ( e.keyCode === 37 || e.keyCode === 65 )
	{
		if ( !this.key.right )
		{
			this.angle.speed = -0.05;
			connect.pushStateEvent( 'key', 2 );
		}

		this.key.left = true;
	}

	// Right
	if ( e.keyCode === 39 || e.keyCode === 68 )
	{
		if ( !this.key.left )
		{
			this.angle.speed = 0.05;
			connect.pushStateEvent( 'key', 3 );
		}

		this.key.right = true;
	}
}

function keyUpListener( e )
{
	// Forward
	if ( e.keyCode === 38 || e.keyCode === 87 )
	{
		this.key.up = false;

		if ( this.key.down )
		{
			this.setVelocity( -1.5 );
			connect.pushStateEvent( 'key', 1 );
		}
		else
		{
			this.setVelocity( 0 );
		}

		connect.pushStateEvent( 'key', 4 );
	}

	// Backward
	if ( e.keyCode === 40 || e.keyCode === 83 )
	{
		this.key.down = false;

		if ( this.key.up )
		{
			this.setVelocity( 1.5 );
			connect.pushStateEvent( 'key', 0 );
		}
		else
		{
			this.setVelocity( 0 );
		}

		connect.pushStateEvent( 'key', 5 );
	}

	// Left
	if ( e.keyCode === 37 || e.keyCode === 65 )
	{
		this.key.left = false;

		if ( this.key.right )
		{
			this.angle.speed = 0.05;
			connect.pushStateEvent( 'key', 3 );
		}
		else
		{
			this.angle.speed = 0;
		}

		connect.pushStateEvent( 'key', 6 );
	}

	// Right
	if ( e.keyCode === 39 || e.keyCode === 68 )
	{
		this.key.right = false;

		if ( this.key.left )
		{
			this.angle.speed = -0.05;
			connect.pushStateEvent( 'key', 2 );
		}
		else
		{
			this.angle.speed = 0;
		}

		connect.pushStateEvent( 'key', 7 );
	}
}