/*

The viewport for the active user, it shifts to center the tank in the screen

*/

function Camera( x, y, width, height )
{
	this.pos = {
		x: x,
		y: y
	};
	this.toPos = {
		x: x,
		y: y
	};

	this.width = window.innerWidth;
	this.height = window.innerHeight;

	// Used to find boundaries since pos is in center
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height / 2;

	this.maxZoom = 0.5;
	this.zoom = 1;
}

// Move the camera to the position at x and y and recalculate its bounding box
Camera.prototype.translate = function ( x, y, boundX, boundY )
{
	this.toPos.x = Math.min( Math.max( x - this.halfWidth, -100 ), boundX - this.width + 100 );
	this.toPos.y = Math.min( Math.max( y - this.halfHeight, -100 ), boundY - this.height + 100 );

	var dX = this.toPos.x - this.pos.x,
		dY = this.toPos.y - this.pos.y;

	if ( Math.abs( dX ) > 2 )
		this.pos.x += Math.sign( dX ) * 2;
	else
		this.pos.x = this.toPos.x;

	if ( Math.abs( dY ) > 2 )
		this.pos.y += Math.sign( dY ) * 2;
	else
		this.pos.y = this.toPos.y;
};

Camera.prototype.scale = function ( bottomX, bottomY, topX, topY )
{
	var width = topX - bottomX,
		height = topY - bottomY,
		zoom = 1;

	if ( width > this.width )
	{
		// Greater than twice the width
		if ( width > this.width << 1 )
			zoom = this.maxZoom;
		else
			zoom = this.width / width;
	}

	if ( height > this.height )
	{
		if ( height > this.height << 1 )
			zoom = this.maxZoom;
		else
			zoom = Math.min( this.height / height, zoom );
	}

	this.zoom = zoom;
};