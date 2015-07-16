/*

A user who controls a

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( './vector' ),
		Cell = require( './cell' ),
		cfg = require( './config' );

	module.exports = Player;
}

function Player( x, y, id, name )
{
	this.id = id;
	this.mass = cfg.cell.mass;

	this.name = name;
	this.texture;

	// Position and position to move towards
	this.pos = new Vector( x, y );
	this.toPos = new Vector( x, y );
	this.cells = [];
}

// Translate and collide with food, viruses, or other players
Player.prototype.nextTick = function ( map )
{
	var mass = 0;

	for ( var i = 0; i < this.cells.length; i++ )
	{
		var cell = this.cells[ i ];
		mass += cell.mass;

		// Don't do anything if the velocity is 0
		if ( cell.velocity.x === 0 && cell.velocity.y === 0 )
		{
			cell.isFoodCollision( map );
			continue;
		}

		// Determine if there are collisions with nearby cells
		var index = cell.isSiblingCollision( this.toPos, this.cells, i, map.tick );
		if ( index > -1 )
		{
			cell.join( this.cells[ index ], map.tick );
			this.cells.splice( index, 1 );
			i--;
			continue;
		}

		// Compensation for a different server position
		if ( cell.deltaPos.x !== 0 || cell.deltaPos.y !== 0 )
		{
			var deltaX = cell.deltaPos.x / 60,
				deltaY = cell.deltaPos.y / 60;

			cell.deltaPos.add( -deltaX, -deltaY );
			cell.pos.add( deltaX, deltaY );
		}

		// Project the velocity onto map boundaries if there is a boundary collision
		cell.isBoundCollision( map );

		// Move by the projected velocity or velocity if there's no collision
		cell.pos.add( cell.projectedVelocity.x, cell.projectedVelocity.y );

		var enemyCell = cell.isEnemyCollision( map );
		if ( enemyCell )
		{
			if ( cell.mass > enemyCell[ 0 ].mass )
			{
				cell.join( enemyCell[ 0 ] );
				map.players[ enemyCell[ 1 ] ].cells.splice( enemyCell[ 2 ], 1 );
			}
			else
			{
				enemyCell[ 0 ].join( cell );
				this.cells.splice( i, 1 );
				i--;
				continue;
			}
		}

		// Eat food
		cell.isFoodCollision( map );

		// Add cells that split after collisions with viruses
		this.cells = this.cells.concat( cell.isVirusCollision( map ) );
	}

	this.mass = mass;
};

// Translate without collisions
Player.prototype.nextTickNoCollision = function ( map )
{

	this.translate( map );
};

// Translate each child cell
Player.prototype.translate = function ( map )
{
	var mass = 0;

	for ( var i = 0; i < this.cells.length; i++ )
	{
		var cell = this.cells[ i ],
			collision = cell.isSiblingCollision( this.toPos, this.cells, i, map.tick );

		mass += cell.mass;

		// Collision with 
		if ( collision > -1 )
			continue;

		// Compensation for a different server position
		if ( cell.deltaPos.x !== 0 || cell.deltaPos.y !== 0 )
		{
			var deltaX = cell.deltaPos.x / 60,
				deltaY = cell.deltaPos.y / 60;

			cell.deltaPos.add( -deltaX, -deltaY );
			cell.pos.add( deltaX, deltaY );
		}

		// Project the velocity onto map boundaries if there is a boundary collision
		cell.isBoundCollision( map );

		// Move by the projected velocity or velocity if there's no collision
		cell.pos.add( cell.projectedVelocity.x, cell.projectedVelocity.y );
	}

	this.mass = mass;
};

// Set the position to move towards
Player.prototype.setToPos = function ( x, y )
{
	this.toPos.set( x, y );

	for ( var i in this.cells )
	{
		var cell = this.cells[ i ],
			unitVector = new Vector( x - cell.pos.x, y - cell.pos.y ).unitVector(),

			// Speed decreases with cell size
			speed = 100 / cell.radius;

		// Set the direction and velocity of the cell
		cell.direction.set( unitVector.x, unitVector.y );
		cell.velocity.set( unitVector.x * speed, unitVector.y * speed );
	}
};

// Split each cell into two equal pieces
Player.prototype.split = function ( map )
{
	for ( var i = 0, numCells = this.cells.length; i < numCells; i++ )
	{
		var sibling = this.cells[ i ].split( map );

		if ( sibling )
			this.cells.push( sibling );
	}
};

// Shoot a piece of food from each cell
Player.prototype.shoot = function ( map )
{
	for ( var i = 0; i < this.cells.length; i++ )
	{
		this.cells[ i ].shoot( map );
	}
};


/*

Object manipulation and cleanup

*/

// Remove a cell and its DOM element if it has one
Player.prototype.removeCell = function ( index )
{
	this.cells[ index ].delete();
	this.cells.splice( index, 1 );
};

// Returns [ position, velocity ]
Player.prototype.toObject = function ()
{

	return [ this.pos.toObject(), this.velocity.toObject() ];
};


/*

Frontend rendering

*/


// Draw as a canvas element
Player.prototype.draw = function ( context, offsetX, offsetY )
{
	context.beginPath();

	for ( var i in this.cells )
	{
		var cell = this.cells[ i ];
		// cell.drawImage( context, offsetX, offsetY, '../img/polandball.png' );
		cell.drawBoundingBox( context, offsetX, offsetY );
	}

	context.stroke();
	context.fill();
};

// Set the player image or color
Player.prototype.initDOM = function ( parent, texture )
{
	this.texture = texture;
	for ( var i in this.cells )
		this.cells[ i ].initDOM( parent, texture, this.name );
};

// Draw as a DOM element
Player.prototype.drawDOM = function ( parent, offsetX, offsetY )
{
	for ( var i in this.cells )
	{
		this.cells[ i ].drawDOM( parent, offsetX, offsetY );
	}
};