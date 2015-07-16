/*

An individual cell/ circle for a player 

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var Vector = require( './vector' ),
		Circle = require( './circle' ),
		cfg = require( './config' );

	module.exports = Cell;
}

function Cell( x, y, mass, playerID, tick )
{
	Circle.call( this, x, y, mass );

	this.player = playerID;
	this.deltaPos = new Vector( 0, 0 );
	this.rejoinTick = 0;
	this.isColliding;

	if ( tick )
		this.setRejoinTick( tick );
}

Cell.prototype = Object.create( Circle.prototype );
Cell.prototype.constructor = Cell;

// Determine if it is time for this cell to rejoin its friends
Cell.prototype.isRejoining = function ( tick )
{
	if ( this.rejoinTick === true )
		return true;

	if ( tick >= this.rejoinTick )
	{
		this.rejoinTick = true;
		return true;
	}

	return false;
};

// Return -1 for a collision with a sibling, 0 - siblings.length for a rejoin collision, and -2 for nothing
Cell.prototype.isSiblingCollision = function ( toPos, siblings, index, tick )
{
	this.isColliding = false;
	this.projectedVelocity.set( this.velocity.x, this.velocity.y );

	for ( var j = siblings.length - 1; j > index; j-- )
	{
		var sibling = siblings[ j ];

		// Determine if the two cells are ready to re-combine
		if ( this.isRejoining( tick ) && sibling.isRejoining( tick ) )
		{
			// Don't combine if the centers are not aligned
			if ( !this.isNearCollision( sibling, this.radius ) )
				continue;

			return j;
		}

		// Do if anywhere near sibling
		if ( !this.isNearCollision( sibling ) )
			continue;

		// Determine if touching sibling
		var point = this.isRadiusCollision( sibling );
		if ( !point )
			continue;

		// Calculate the vector from the point of collision to the destination position and add that to the current velocity
		var unitVector = new Vector( toPos.x - point.x - this.pos.x, toPos.y - point.y - this.pos.y ).unitVector();
		this.projectedVelocity.set( unitVector.x + this.velocity.x, unitVector.y + this.velocity.y );

		this.isColliding = true;
		sibling.isColliding = true;
	}

	if ( this.isColliding )
		return -1;

	return -2;
};

// Colliding with cells of other players
Cell.prototype.isEnemyCollision = function ( map )
{
	for ( var id in map.players )
	{
		if ( this.player === id )
			continue;

		var player = map.players[ id ];
		for ( var i in player.cells )
		{
			var cell = player.cells[ i ];
			if ( !this.isNearCollision( cell, Math.min( this.radius, cell.radius ) ) )
				continue;

			// No collision if the masses are within 10% of each other
			if ( Math.abs( this.mass - cell.mass ) < 20 )
				continue;

			return [ cell, id, i ];
		}
	}
};

// Colliding with spiky viruses
Cell.prototype.isVirusCollision = function ( map )
{
	var siblings = [];

	// Unsplittable if we are too small
	if ( this.mass < cfg.cell.min_split_mass )
		return siblings;

	for ( var j = 0; j < map.viruses.length; j++ )
	{
		var virus = map.viruses[ j ];

		// Determine if the virus is anywhere close
		if ( !this.isNearCollision( virus ) )
			continue;

		// Determine if the virus is colliding
		if ( !this.isRadiusCollision( virus, this.radius + 10 ) )
			continue;

		siblings = siblings.concat( this.explode( map ) );

		// Remove the virus from the map
		map.remove( 'virus', j );
	}

	return siblings;
};

// Colliding with foods ( not a word )
Cell.prototype.isFoodCollision = function ( map )
{
	var foodCount = 0;

	for ( var j = 0; j < map.food.length; j++ )
	{
		var food = map.food[ j ];

		// Determine if the food is anywhere close
		if ( !this.isNearCollision( food ) )
			continue;

		// Determine if the food is colliding
		if ( !this.isRadiusCollision( food, this.radius ) )
			continue;

		// If food is colliding, increase mass by 1
		this.setMass( this.mass + 1 );
		foodCount++;

		// Remove the food from the map
		map.remove( 'food', j );
	}

	return foodCount;
};

// Check if there is a map boundary collision, and if there is, velocity is zero on the wall axis
Cell.prototype.isBoundCollision = function ( map )
{
	// Check for collisions with the left or right border
	if ( this.pos.x < this.radius && this.projectedVelocity.x < 0 )
		this.projectedVelocity.x = 0;
	else if ( this.pos.x > map.width - this.radius && this.projectedVelocity.x > 0 )
		this.projectedVelocity.x = 0;

	// Check for collisions with the top or bottom border
	if ( this.pos.y < this.radius && this.projectedVelocity.y < 0 )
		this.projectedVelocity.y = 0;
	else if ( this.pos.y > map.height - this.radius && this.projectedVelocity.y > 0 )
		this.projectedVelocity.y = 0;
};

// Join two cells together and add their mass
Cell.prototype.join = function ( sibling, tick )
{
	this.setMass( this.mass + sibling.mass );
	this.setRejoinTick( tick );
};

// Explode into one big piece and a bunch of small pieces
Cell.prototype.explode = function ( map )
{
	// Random number of times we can divide, at least once
	var divisions = Math.max( Math.floor( Math.random() * ( ( this.mass - cfg.cell.min_split_mass ) / ( cfg.cell.min_shoot_mass ) ) ), 1 ),
		siblings = [],
		speed = 100 / cfg.cell.min_mass;

	this.setMass( this.mass - divisions * ( cfg.cell.min_shoot_mass ) );
	this.setRejoinTick( map.tick );

	for ( var j = 0; j < divisions; j++ )
	{
		var sibling = map.spawnCell( this.pos.x, this.pos.y, cfg.cell.min_mass, this.player ),
			x = Math.sign( 1 - Math.random() ) * this.direction.y * speed,
			y = Math.sign( 1 - Math.random() ) * this.direction.x * speed;

		sibling.velocity.set( x, y );
		siblings.push( sibling );
	}

	return siblings;
};

// Split into two equal size cells in the direction of movement
Cell.prototype.split = function ( map )
{
	if ( this.mass <= cfg.cell.min_split_mass )
		return;

	// Halve the mass
	this.setMass( this.mass >> 1 );
	this.setRejoinTick( map.tick );

	// Set the sibling to rejoin after a time (a function of radius)
	var sibling = map.spawnCell( this.pos.x, this.pos.y, this.mass, this.player );
	sibling.velocity.set( this.velocity.x, this.velocity.y );

	return sibling;
};

// Shoot a piece of food in the direction of movement
Cell.prototype.shoot = function ( map )
{
	if ( this.mass < cfg.cell.min_shoot_mass )
		return;

	this.setMass( this.mass - cfg.cell.shoot_mass );

	// Create a new food in the direction of movement
	var food = map.spawnFood( this.pos.x + this.direction.x * this.radius * 1.5, this.pos.y + this.direction.y * this.radius * 1.5 );
	food.direction.set( this.direction.x, this.direction.y );
	food.velocity.set( this.direction.x * 5, this.direction.y * 5 );
	food.acceleration.set( -this.direction.x / 10, -this.direction.y / 10 );

	return food;
};

// Set the time when this cell can rejoin with its siblings
Cell.prototype.setRejoinTick = function ( tick )
{

	this.rejoinTick = tick + ( this.mass << cfg.cell.rejoin_factor );
};


/*

Object manipulation and cleanup

*/


// Returns [ position, velocity ]
Cell.prototype.toObject = function ()
{

	return [ this.pos.toObject(), this.velocity.toObject(), this.mass, this.rejoinTick ];
};