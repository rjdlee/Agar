/*

LOL CIRCLES, IS THIS UNMINECRAFT?

*/

function Circle( pos, boundingBox, velocity )
{
	this.pos = pos ||
	{
		x: 0,
		y: 0
	};

	this.radius = 0;

	this.velocity = velocity ||
	{
		x: 0,
		y: 0
	}
}