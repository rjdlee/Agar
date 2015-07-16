function Quadtree( x, y, width, height, level )
{
	this.pos = {
		x: x,
		y: y
	};
	this.width = width;
	this.height = height;

	this.maxObjects = 10;
	this.maxLevel = 5;

	this.level = level;
	this.objects = [];
	this.nodes = new Array( 4 );
}

// Clear the quadtree's objects and child nodes
Quadtree.prototype.clear = function ()
{
	for ( var i = 0; i < this.nodes.length; i++ )
	{
		this.nodes[ i ].clear();
	}

	this.objects = [];
	this.nodes = new Array( 4 );
};

// Split a quadtree into 4 child quadrants
Quadtree.prototype.split = function ()
{
	var x = this.pos.x,
		y = this.pos.y,
		halfWidth = this.width >> 1,
		halfHeight = this.height >> 1,
		nextLevel = this.level + 1;

	this.nodes[ 0 ] = new Quadtree( x, y, halfWidth, halfHeight, nextLevel );
	this.nodes[ 1 ] = new Quadtree( x + halfWidth, y, halfWidth, halfHeight, nextLevel );
	this.nodes[ 2 ] = new Quadtree( x, y + halfHeight, halfWidth, halfHeight, nextLevel );
	this.nodes[ 3 ] = new Quadtree( x + halfWidth, y + halfHeight, halfWidth, halfHeight, nextLevel );
};

// Get the quadrant of an object
Quadtree.prototype.getIndex = function ( object )
{
	var midpointX = this.pos.x + ( this.width >> 1 ),
		midpointY = this.pos.y + ( this.height >> 1 ),

		// Determine if object is in top half or bottom half
		topQuadrant = object.pos.y < midpointY && object.pos.y + object.radius < midpointY,
		bottomQuadrant = object.pos.y > midpointY;

	// Determine if object is in left half
	if ( object.pos.x < midpointX && object.pos.x + object.width < midpointX )
	{
		if ( topQuadrant )
		{
			return 0;
		}
		else if ( bottomQuadrant )
		{
			return 2;
		}
	}

	// Determine if object is in right half
	if ( object.pos.x > midpointX )
	{
		if ( topQuadrant )
		{
			return 1;
		}
		else if ( bottomQuadrant )
		{
			return 3;
		}
	}

	return -1;
};

// Insert an object into the quadtree or its children
Quadtree.prototype.insert = function ( object )
{
	// Ensure there are child nodes
	if ( this.nodes[ 0 ] )
	{
		var index = this.getIndex( object );

		// If the object is in a child node, insert it there
		if ( index !== -1 )
		{
			this.nodes[ index ].insert( object );

			return;
		}
	}

	// Add the object to this node if it wasn't inserted into the child nodes
	this.objects.push( object );

	// Determine if we must split this node into four more
	if ( this.objects.length > this.maxObjects && this.level < this.maxLevel )
	{
		// Only split if we haven't split already
		if ( this.nodes[ 0 ] )
		{
			return;
		}

		this.split();

		var i = 0;
		while ( i < this.objects.length )
		{
			var index = this.getIndex( this.objects[ i ] );

			// If the object is in a child node, insert it there
			if ( index !== -1 )
			{
				this.nodes[ index ].insert( this.objects.splice( i, 1 ) );
				continue;
			}

			i++;
		}
	}
};

// Remove an object from the quadtree
Quadtree.prototype.remove = function ( object )
{
	var index = this.getIndex( object );
	if ( index !== -1 && this.nodes[ 0 ] )
	{
		return this.nodes[ index ].remove( object );
	}

	for ( var i = 0; i < this.objects.length; i++ )
	{
		if ( this.objects[ i ] === object )
		{
			this.objects.splice( i, 1 );
			return true;
		}
	}

	return false;
};

// Retrieve all the objects near the object
Quadtree.prototype.retrieve = function ( returnObjects, object )
{
	// Recursively add child nodes' objects to the returnObjects array
	var index = this.getIndex( object );
	if ( index !== -1 && this.nodes[ 0 ] )
	{
		this.nodes[ index ].retrieve( returnObjects, object );
	}

	// Add this node's objects to the returnObjects array
	returnObjects = returnObjects.concat( this.objects );

	return returnObjects;
};