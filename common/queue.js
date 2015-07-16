// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	var BISON = require( './bison' );

	module.exports = IDEventQueue;
}


/*

Keep track of a history of input events for multiple ids

*/

function IDEventQueue()
{

	this.events = {};
}

// Adds an event with the format of: id: [[ key, data, timestamp ]]
IDEventQueue.prototype.add = function ( id, key, data, time )
{
	if ( typeof time === 'undefined' )
		time = this.getTime().toString();

	var e = [ key, data, time ];

	if ( id in this.events )
		this.events[ id ].push( e );
	else
		this.events[ id ] = [ e ];
};

IDEventQueue.prototype.clear = function ()
{

	this.events = {};
};

// Binary JSON encodes and sends the eventqueue if it isn't empty
IDEventQueue.prototype.send = function ( connection )
{
	if ( Object.keys( this.events ).length === 0 )
		return false;

	connection.emit( 'e', BISON.encode( this.events ) );
	this.clear();
};

// Gets the current epoch time
IDEventQueue.prototype.getTime = function ()
{

	return new Date().getTime();
};


/*

Keep track of a history of input events for a user

*/


function EventQueue()
{

	this.events = [];
}

// Binary JSON encodes and sends the eventqueue if it isn't empty
EventQueue.prototype.send = function ( connection )
{
	if ( this.events.length === 0 )
		return false;

	connection.emit( 'e', BISON.encode( this.events ) );
	this.events = [];
};

// Adds an event with the format of: [ key, data, timestamp ]
EventQueue.prototype.add = function ( key, data )
{

	this.events.push( [ key, data, this.getTime().toString() ] );
};

// Gets the current epoch time
EventQueue.prototype.getTime = function ()
{

	return new Date().getTime();
};