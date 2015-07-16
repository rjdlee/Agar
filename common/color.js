/*

An RGB color object with random color generation functionality

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	module.exports = Color;
}

// Constants for random color generation
var saturation = 0.5,
	value = 0.95;

function Color( r, g, b )
{
	this.r = r;
	this.g = g;
	this.b = b;

	if ( !r && !g && !b )
		this.random();
}

// Set this to a random color
Color.prototype.random = function ()
{
	var hue = Math.round( 360 * Math.random() );
	this.fromHSV( hue, saturation, value );
};

// Set this to the RGB converted from the HSV passed
Color.prototype.fromHSV = function ( hue, saturation, value )
{
	// https://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
	var chroma = value * saturation,
		hue1 = hue / 60,
		x = chroma * ( 1 - Math.abs( ( hue1 % 2 ) - 1 ) ),
		m = value - saturation,

		r1 = 0,
		g1 = 0,
		b1 = 0;

	if ( hue1 < 1 )
	{
		r1 = chroma;
		g1 = x;
		b1 = 0;
	}

	if ( hue1 < 2 )
	{
		r1 = x;
		g1 = chroma;
		b1 = 0;
	}

	if ( hue1 < 3 )
	{
		r1 = 0;
		g1 = chroma;
		b1 = x;
	}

	if ( hue1 < 4 )
	{
		r1 = 0;
		g1 = x;
		b1 = chroma;
	}

	if ( hue1 < 5 )
	{
		r1 = x;
		g1 = 0;
		b1 = chroma;
	}

	if ( hue1 < 6 )
	{
		r1 = chroma;
		g1 = 0;
		b1 = x;
	}

	this.r = 255 * Math.round( r1 + m );
	this.b = 255 * Math.round( b1 + m );
	this.g = 255 * Math.round( g1 + m );
};

// Returns this color as HEX
Color.prototype.toHex = function ()
{
	// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	return "#" + ( ( 1 << 24 ) + ( this.r << 16 ) + ( this.g << 8 ) + this.b ).toString( 16 ).slice( 1 );
};