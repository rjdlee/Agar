// var express = require( 'express' ),
// 	app = express(),
// 	server = app.listen( 3000, '127.0.0.1', function ()
// 	{
// 		console.log( 'Listening at http://%s:%s', server.address().address, server.address().port );
// 	} ),
// 	io = require( 'socket.io' )( server ),
// 	fs = require( 'fs' ),
// 	path = require( 'path' ),
// 	url = require( 'url' ),

// 	main = require( './server/main' )( io );

// app.use( '/common', express.static( __dirname + '/common' ) );
// app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
// app.use( express.static( __dirname + '/public' ) );

var http = require( 'http' );

http.createServer( function ( req, res )
{
	res.writeHead( 200,
	{
		'Content-Type': 'text/plain'
	} );
	res.end( 'Hello World\n' );
} ).listen( 3000, "127.0.0.1" );
console.log( 'Server running at http://127.0.0.1:3000/' );