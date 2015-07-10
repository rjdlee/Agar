var mainCanvas = document.getElementById( 'main-canvas' ),
	terrainCanvas = document.getElementById( 'terrain-canvas' );

mainCanvas.width = window.innerWidth;
mainCanvas.height = window.innerHeight;
terrainCanvas.width = mainCanvas.width;
terrainCanvas.height = mainCanvas.height;

var context = mainCanvas.getContext( '2d' ),
	terrainContext = terrainCanvas.getContext( '2d' ),

	map,

	leaderboard = [
		{
			score: 0
	} ],

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

	context.clearRect( 0, 0, map.width, map.height );
	context.beginPath();

	terrainContext.clearRect( 0, 0, map.width, map.height );
	terrainContext.beginPath();

	map.tick();
	map.draw( context, terrainContext, user.camera );

	terrainContext.fill();
	context.stroke();

	// Send event data to the server
	connect.sendStateQueue();
}