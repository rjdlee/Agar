/*

The viewport for the active user, it shifts to center the tank in the screen

*/

function Camera( x, y, width, height )
{
	this.pos = {
		x: x,
		y: y
	};

	this.width = width;
	this.height = height;

	// Used to find boundaries since pos is in center
	this.halfWidth = this.width >> 2;
	this.halfHeight = this.height >> 2;
}

// Move the camera to the position at x and y and recalculate its bounding box
Camera.prototype.translate = function ( x, y, boundX, boundY )
{
	this.pos.x = Math.min( Math.max( x - this.halfWidth, 0 ), boundX - this.width );
	this.pos.y = Math.min( Math.max( y - this.halfHeight, 0 ), boundY - this.height );
};