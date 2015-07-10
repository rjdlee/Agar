var app = require( 'http' ).createServer( handler ),
	io = require( 'socket.io' )( app ),
	main = require( './main' )( io ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	url = require( 'url' );

app.listen( 8888 );

function handler( req, res )
{
	var filePath = path.dirname( __dirname );
	if ( req.url.indexOf( 'common' ) > -1 || req.url.indexOf( 'node_modules' ) > -1 )
	{
		filePath += req.url;
	}
	else if ( req.url === '/' )
		filePath += '/client/index.html';
	else
	{
		filePath += '/client' + req.url;
	}

	fs.readFile( filePath,
		function ( err, data )
		{
			if ( err )
			{
				res.writeHead( 500 );
				return res.end( 'Error loading index.html' );
			}

			res.writeHead( 200 );
			res.end( data );
		} );
}