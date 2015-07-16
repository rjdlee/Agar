var express = require( 'express' ),
	app = express(),
	server = app.listen( 2222 ),
	io = require( 'socket.io' )( server ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	url = require( 'url' ),

	main = require( './server/main' )( io );

app.use( '/common', express.static( __dirname + '/common' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( express.static( __dirname + '/public' ) );