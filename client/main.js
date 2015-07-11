var width = window.innerWidth,
	height = window.innerHeight,
	mainCanvas = document.getElementById( 'main-canvas' ),
	terrainCanvas = document.getElementById( 'terrain-canvas' );

mainCanvas.width = terrainCanvas.width = width;
mainCanvas.height = terrainCanvas.height = height;

var context = mainCanvas.getContext( '2d' ),
	terrainContext = terrainCanvas.getContext( '2d' ),

	map,

	name,
	user,
	connect;

terrainContext.fillStyle = '#F1F1F1';

function init()
{
	connect = new Connect();
}

// Recursive function which will attempt to draw at 60fps
function animate()
{
	requestAnimFrame( animate );
	draw();
}

// Main drawing function to display tanks
function draw()
{
	if ( !map || !user )
		return false;

	context.clearRect( 0, 0, width, height );
	context.beginPath();

	terrainContext.clearRect( 0, 0, width, height );
	terrainContext.beginPath();

	map.tick();
	map.draw( context, terrainContext, user.camera );

	terrainContext.fill();
	context.stroke();

	// Send event data to the server
	connect.sendStateQueue();
}