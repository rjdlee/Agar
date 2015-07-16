/*

A user input controlled player which uses keyboard and mouse events
Extends: Player

*/

function Controller( x, y, id, name )
{
	Player.call( this, x, y, id, name );

	this.camera = new Camera( x, y );
	this.queue = new EventQueue();

	this.key = {
		w: false,
		space: false
	};

	this.checkListeners();
}

Controller.prototype = Object.create( Player.prototype );
Controller.prototype.constructor = Controller;

Controller.prototype.nextTick = function ( map )
{
	Player.prototype.nextTick.call( this, map );
	this.setCameraPos();

	ui.drawScore( this.mass );
};

Controller.prototype.nextTickNoCollision = function ( map )
{
	this.translate( map );
	this.setCameraPos();

	ui.drawScore( this.mass );
};

Controller.prototype.setCameraPos = function ()
{
	if ( this.cells.length === 0 )
		return false;

	var massPos = this.cells[ 0 ].pos,
		mass = this.cells[ 0 ].mass,

		pos = this.cells[ 0 ].pos,
		bounds = [ pos.x, pos.y, pos.x, pos.y ];

	for ( var i = 1; i < this.cells.length; i++ )
	{
		if ( this.cells[ i ].mass > mass )
		{
			massPos = this.cells[ i ].pos;
			mass = this.cells[ i ].mass;
		}
		pos = this.cells[ i ].pos;

		if ( pos.x < bounds[ 0 ] )
			bounds[ 0 ] = pos.x;
		if ( pos.x > bounds[ 2 ] )
			bounds[ 2 ] = pos.x;

		if ( pos.y < bounds[ 1 ] )
			bounds[ 1 ] = pos.y;
		if ( pos.y > bounds[ 3 ] )
			bounds[ 3 ] = pos.y;
	}

	var width = bounds[ 2 ] - bounds[ 0 ],
		height = bounds[ 3 ] - bounds[ 1 ];

	if ( width > this.camera.width || height > this.camera.height )
	{
		this.pos.x = massPos.x;
		this.pos.y = massPos.y;
	}
	else
	{
		this.pos.x = ( width >> 1 ) + bounds[ 0 ];
		this.pos.y = ( height >> 1 ) + bounds[ 1 ];

	}

	this.camera.translate( this.pos.x, this.pos.y, map.width, map.height );
	// this.camera.scale( bounds[ 0 ], bounds[ 1 ], bounds[ 2 ], bounds[ 3 ] );
};

// Assign listeners for mousemove, mousedown, keydown, and keyup
Controller.prototype.checkListeners = function ()
{
	document.addEventListener( 'mousemove', mouseMoveListener.bind( this ), false );
	document.addEventListener( 'keydown', keyDownListener.bind( this ), false );
	document.addEventListener( 'keyup', keyUpListener.bind( this ), false );

	function mouseMoveListener( e )
	{
		// Position in relation to the map
		var mapX = e.pageX + this.camera.pos.x,
			mapY = e.pageY + this.camera.pos.y;


		this.setToPos( mapX, mapY );

		this.queue.add( 'toPos',
		{
			x: mapX,
			y: mapY
		} );
	}

	// If up is pressed before down, move forward. When up is released, move backwards if down is still pressed.
	function keyDownListener( e )
	{
		// W
		if ( e.keyCode === 87 )
		{
			this.key.w = true;
			// this.shoot( map );

			this.queue.add( 'shoot' );
		}

		// Space
		if ( e.keyCode === 32 )
		{
			this.key.space = true;
			// this.split( map );

			this.queue.add( 'split' );
		}
	}

	function keyUpListener( e )
	{
		// W
		if ( e.keyCode === 87 )
		{
			this.key.w = false;
		}

		// Space
		if ( e.keyCode === 32 )
		{
			this.key.space = false;
		}
	}
};