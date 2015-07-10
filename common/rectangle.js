/*

Core geometry class with collision detection and a bounding box with matrix transformations

*/

function Rectangle( config )
{
	// Position relative to canvas context
	this.pos = config && config.pos ? config.pos :
	{
		x: 0,
		y: 0
	};
	this.lastPos = {
		x: 0,
		y: 0
	};

	// Speed is scalar, velocity is vector
	this.speed = 0;
	this.velocity = {
		x: 0,
		y: 0
	};

	// Total width and height
	this.width = config && config.width ? config.width : 0;
	this.height = config && config.height ? config.height : 0;

	// Used for optimizing bounding box calculations
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height / 2;

	// Calculate a circle bounding box for preliminary collision detection
	this.radius = Math.sqrt( Math.pow( this.halfWidth, 2 ) + Math.pow( this.halfHeight, 2 ) );

	this.boundingBox = [];
	this.edges = [];

	// The point for the rectangle to rotate around, if not an argument, set it to the center
	// Values are 0 to 1 where 0 is the top left
	var angleOrigin = config && config.transform && config.transform.origin ? config.transform.origin :
	{
		x: 0.5,
		y: 0.5,
	};

	// Information about the rotation
	this.angle = {

		// The angle is clockwise from the positive x axis (3 o'clock...)
		rad: config && config.transform && config.transform.angle ? config.transform.angle : 0,
		speed: 0,

		// Sin and Cos are precomputed angle values used in bounding box calculations
		sin: 0,
		cos: 1,

		// Point to rotate the rectangle around
		origin: angleOrigin,

		// Pre-computed values to be used in the transformation matrix
		width: this.width * ( angleOrigin.x - 0.5 ),
		height: this.height * ( angleOrigin.y - 0.5 )
	};

	// Bounding box: [ Top left, Top right, Bottom right, Bottom left ]
	this.setAngle( this.angle.rad );
}

// Sets the rectangle's position to x and y and updates its bounding box
Rectangle.prototype.setPos = function ( x, y )
{
	this.lastPos.x = this.pos.x;
	this.lastPos.y = this.pos.y;

	this.pos.x = x;
	this.pos.y = y;

	this.translateBoundingBox();
};

// Moves the rectangle's position by x and y and updates its bounding box
Rectangle.prototype.movePos = function ( x, y )
{
	this.lastPos.x = this.pos.x;
	this.lastPos.y = this.pos.y;

	this.pos.x += x;
	this.pos.y += y;

	this.translateBoundingBox();
};

// Sets the rectangle's speed and velocity
Rectangle.prototype.setVelocity = function ( speed )
{
	this.speed = speed;
	this.velocity.x = speed * this.angle.cos;
	this.velocity.y = speed * this.angle.sin;
};

// Sets the rectangle's angle, direction of velocity, and updates its bounding box
Rectangle.prototype.setAngle = function ( angle )
{
	this.angle.rad = angle;
	this.angle.cos = Math.cos( angle );
	this.angle.sin = Math.sin( angle );

	if ( this.speed !== 0 )
	{
		this.setVelocity( this.speed );
	}

	this.rotateBoundingBox();
};

Rectangle.prototype.rotateBoundingBox = function ()
{
	// Use a rotation transform matrix: cos(θ) -sin(θ) 0
	// 									sin(θ) cos(θ)  0
	// 									0	   0	   1
	var cos = this.angle.cos,
		sin = this.angle.sin,
		offsetWidth = this.angle.width + this.halfWidth,
		offsetHeight = this.angle.height + this.halfHeight,
		offsetWidthMinus = -this.halfWidth + this.angle.width,
		offsetHeightMinus = -this.halfHeight + this.angle.height;

	// After applying the matrix, translate the shape to its (x,y) position
	this.boundingBox[ 0 ] = {
		x: offsetWidth * cos - offsetHeight * sin + this.pos.x,
		y: offsetWidth * sin + offsetHeight * cos + this.pos.y
	};
	this.boundingBox[ 1 ] = {
		x: offsetWidthMinus * cos - offsetHeight * sin + this.pos.x,
		y: offsetWidthMinus * sin + offsetHeight * cos + this.pos.y
	};
	this.boundingBox[ 2 ] = {
		x: offsetWidthMinus * cos - offsetHeightMinus * sin + this.pos.x,
		y: offsetWidthMinus * sin + offsetHeightMinus * cos + this.pos.y
	};
	this.boundingBox[ 3 ] = {
		x: offsetWidth * cos - offsetHeightMinus * sin + this.pos.x,
		y: offsetWidth * sin + offsetHeightMinus * cos + this.pos.y
	};

	this.updateEdges();
	this.updateBounds();
};

Rectangle.prototype.translateBoundingBox = function ()
{
	var deltaX = this.pos.x - this.lastPos.x,
		deltaY = this.pos.y - this.lastPos.y;

	for ( var i = 0; i < this.boundingBox.length - 2; i++ )
	{
		this.boundingBox[ i ].x += deltaX;
		this.boundingBox[ i ].y += deltaY;
	}

	this.updateEdges();
};

// Apply rotation and translation offsets to the bounding box
// 0: Bottom Right, 1: Bottom Left, 2: Top Left, 3: Top Right
Rectangle.prototype.updateEdges = function ()
{
	// Determine the edges of the shape
	this.edges[ 0 ] = {
		x: this.boundingBox[ 1 ].x - this.boundingBox[ 0 ].x,
		y: this.boundingBox[ 1 ].y - this.boundingBox[ 0 ].y
	};
	this.edges[ 1 ] = {
		x: this.boundingBox[ 2 ].x - this.boundingBox[ 1 ].x,
		y: this.boundingBox[ 2 ].y - this.boundingBox[ 1 ].y
	};
	this.edges[ 2 ] = {
		x: this.boundingBox[ 3 ].x - this.boundingBox[ 2 ].x,
		y: this.boundingBox[ 3 ].y - this.boundingBox[ 2 ].y
	};
	this.edges[ 3 ] = {
		x: this.boundingBox[ 0 ].x - this.boundingBox[ 3 ].x,
		y: this.boundingBox[ 0 ].y - this.boundingBox[ 3 ].y
	};
}

// Finds the minimum and maximum x and y bounds
Rectangle.prototype.updateBounds = function ()
{
	// Include the index of the edge boundaries
	var lowerBound = {
			x: this.boundingBox[ 0 ].x,
			y: this.boundingBox[ 0 ].y,
			xi: 0,
			yi: 0
		},
		upperBound = {
			x: this.boundingBox[ 0 ].x,
			y: this.boundingBox[ 0 ].y,
			xi: 0,
			yi: 0
		};

	for ( var i = 1; i < 4; i++ )
	{
		var currentBound = this.boundingBox[ i ];

		if ( currentBound.x < lowerBound.x )
		{
			lowerBound.xi = i;
			lowerBound.x = currentBound.x;
		}
		else if ( currentBound.x > upperBound.x )
		{
			upperBound.xi = i;
			upperBound.x = currentBound.boundX
		}

		if ( currentBound.y < lowerBound.y )
		{
			lowerBound.yi = i;
			lowerBound.y = currentBound.y;
		}
		else if ( currentBound.y > upperBound.y )
		{
			upperBound.yi = i;
			upperBound.y = currentBound.y;
		}
	}

	this.boundingBox[ 4 ] = lowerBound;
	this.boundingBox[ 5 ] = upperBound;
};

// Draw the bounding box onto the canvas context
Rectangle.prototype.drawBoundingBox = function ( context, offsetX, offsetY )
{
	var boundingBox = this.boundingBox;

	if ( !offsetX )
		offsetX = 0;

	if ( !offsetY )
		offsetY = 0;

	context.moveTo( boundingBox[ 0 ].x - offsetX, boundingBox[ 0 ].y - offsetY );
	context.lineTo( boundingBox[ 1 ].x - offsetX, boundingBox[ 1 ].y - offsetY );
	context.lineTo( boundingBox[ 2 ].x - offsetX, boundingBox[ 2 ].y - offsetY );
	context.lineTo( boundingBox[ 3 ].x - offsetX, boundingBox[ 3 ].y - offsetY );
	context.lineTo( boundingBox[ 0 ].x - offsetX, boundingBox[ 0 ].y - offsetY );

	// Use this to display the first point
	// context.arc( this.boundingBox[ 0 ].x, this.boundingBox[ 0 ].y, 2, 0, 6, false );
	// context.moveTo( this.boundingBox[ 0 ].x, this.boundingBox[ 0 ].y );
};

// Rough collision approximation to check if rectangle is close to the polygon
Rectangle.prototype.isRadiusCollision = function ( polygon, radius )
{
	// If no radius, use the combinaed radii plus a bit more
	if ( !radius )
		radius = this.radius + polygon.radius + 20;

	if ( sqrtApprox( polygon.pos.x - this.pos.x, polygon.pos.y - this.pos.y ) <= radius )
		return true;

	return false;
};

// Determine if there is a collision with the array of unrotated rectangles
Rectangle.prototype.isRectangleCollision = function ( rectangles )
{
	var boundingBox = this.boundingBox;

	// Iterate through the map rectangles
	for ( var id in rectangles )
	{
		if ( !this.isRadiusCollision( rectangles[ id ] ) )
			continue;

		var wallBoundingBox = rectangles[ id ].boundingBox;

		// Iterate through the bounds of this
		for ( var i = 0; i < boundingBox.length - 2; i++ )
		{
			var bound = boundingBox[ i ],

				// Calculate the overlaps of the x and y position of the wall and bound
				overlaps = [
					bound.y - wallBoundingBox[ 0 ].y,
					bound.x - wallBoundingBox[ 1 ].x,
					bound.y - wallBoundingBox[ 2 ].y,
					bound.x - wallBoundingBox[ 3 ].x
				];

			// If the bound is contained within the wall
			if ( overlaps[ 0 ] <= 0 && overlaps[ 1 ] >= 0 && overlaps[ 2 ] >= 0 && overlaps[ 3 ] <= 0 )
			{
				var edges = rectangles[ id ].edges,
					edge = 0,
					overlap = -overlaps[ 0 ];

				// Find the side of least overlap
				for ( var i = 1; i < 4; i++ )
				{
					if ( Math.abs( overlaps[ i ] ) < Math.abs( overlap ) )
					{
						edge = i;
						overlap = -overlaps[ i ];
					}
				}

				edge = {
					x: Math.sign( edges[ edge ].x ),
					y: Math.sign( edges[ edge ].y )
				};

				return [ edge, overlap, id ];
			}
		}
	}

	return false;
};

// Returns false if there is no collision
Rectangle.prototype.isRotatedRectangleCollision = function ( polygon )
{
	if ( !this.isRadiusCollision( polygon ) )
		return false;

	var collisionA = isCollidingWith( this, polygon, true );
	if ( !collisionA[ 0 ] )
		return false;

	var collisionB = isCollidingWith( polygon, this, false );
	if ( !collisionB[ 0 ] )
		return false;

	var edge = polygon.edges[ collisionB[ 2 ] ],
		edgeMagnitude = collisionB[ 2 ] === 0 | collisionB[ 2 ] === 2 ? 50 : 25,
		edgeUnitVector = {
			x: edge.x / edgeMagnitude,
			y: edge.y / edgeMagnitude
		};

	return edgeUnitVector;
};

// Helper function for isCollision, finds if polygonA's edges collides with polygonB's vertices
function isCollidingWith( polygonA, polygonB, isAMoving )
{
	// https://stackoverflow.com/questions/115426/algorithm-to-detect-intersection-of-two-rectangles?rq=1
	// http://imgur.com/bNwrzsv

	var edges = polygonA.edges,
		leastOverlap = Infinity,
		leastOverlapEdge = 0,

		separatingAxis = false,
		oppositeSides,
		normal,

		currentPoint,
		nextPoint,

		shapeVector,
		shape1DotProduct,
		shape1DotProductSign;

	for ( var i = 0; i < edges.length; i++ )
	{
		oppositeSides = true;

		normal = {
			x: -edges[ i ].y,
			y: edges[ i ].x
		};

		currentPoint = polygonA.boundingBox[ i ];
		nextPoint = i < 2 ? polygonA.boundingBox[ i + 2 ] : polygonA.boundingBox[ i - 2 ];

		shapeVector = {
			x: nextPoint.x - currentPoint.x,
			y: nextPoint.y - currentPoint.y
		};
		shape1DotProduct = shapeVector.x * normal.x + shapeVector.y * normal.y;
		shape1DotProductSign = shape1DotProduct >= 0;

		var min = Infinity,
			max = -Infinity;
		for ( var j = 0; j < 4; j++ )
		{
			nextPoint = polygonB.boundingBox[ j ];

			shapeVector = {
				x: nextPoint.x - currentPoint.x,
				y: nextPoint.y - currentPoint.y,
			};

			var shape2DotProduct = shapeVector.x * normal.x + shapeVector.y * normal.y,
				shape2DotProductSign = shape2DotProduct >= 0;

			if ( shape2DotProductSign === shape1DotProductSign )
				oppositeSides = false;

			if ( shape2DotProduct < min )
				min = shape2DotProduct;
			else if ( shape2DotProduct > max )
				max = shape2DotProduct;
		}

		if ( oppositeSides )
		{
			separatingAxis = true;

			if ( isAMoving )
				break;
		}

		var overlap;
		if ( min < shape1DotProduct )
			overlap = max - shape1DotProduct;
		else
			overlap = max - min;

		if ( overlap < leastOverlap )
		{
			leastOverlap = overlap;
			leastOverlapEdge = i;
		}
	}

	return [ !separatingAxis, leastOverlap, leastOverlapEdge ];
}

// Efficient approximation for the square root of a and b
function sqrtApprox( a, b )
{
	// https://stackoverflow.com/questions/3506404/fast-hypotenuse-algorithm-for-embedded-processor
	return 4142 * Math.abs( a ) / 10000 + Math.abs( b );
}