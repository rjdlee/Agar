/*

Describes stationary walls on the map
Extends: Rectangle

*/

// Width and height
function Wall( x, y, width, height )
{
	// Extend the Rectangle class
	Rectangle.call( this,
	{
		pos:
		{
			x: x,
			y: y
		},
		width: width,
		height: height
	} );
}

Wall.prototype = Object.create( Rectangle.prototype );
Wall.prototype.constructor = Wall;

// Draw the bounding box
Wall.prototype.draw = function ( context, camera )
{
	this.drawBoundingBox( context, camera.pos.x, camera.pos.y );
};