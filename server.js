var express = require( 'express' ),
	app = express(),

	ioApp = require( 'http' ).createServer(),
	io = require( 'socket.io' )( ioApp ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	url = require( 'url' ),

	main = require( './server/main' )( io );

app.listen( 8080 );
ioApp.listen( 8888 );

app.use( '/common', express.static( __dirname + '/common' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( express.static( __dirname + '/public' ) );