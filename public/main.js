var ui = new UI(),

	map,
	user,

	width = window.innerWidth,
	height = window.innerHeight,

	cellCanvas = ui.getID( 'cell-canvas' ),
	gridCanvas = ui.getID( 'grid-canvas' ),
	foodCanvas = ui.getID( 'food-canvas' ),
	virusCanvas = ui.getID( 'virus-canvas' ),

	gridContext = gridCanvas.getContext( '2d' ),
	foodContext = foodCanvas.getContext( '2d' ),
	virusContext = virusCanvas.getContext( '2d' ),

	connect = new Connect();

ui.setListeners( connect );

function isNumeric( n )
{
	return !isNaN( parseFloat( n ) ) && isFinite( n );
}

function init()
{
	if ( animateInterval )
		cancelAnimationFrame( animateInterval );

	gridCanvas.width = foodCanvas.width = virusCanvas.width = cfg.map.width;
	gridCanvas.height = foodCanvas.height = virusCanvas.height = cfg.map.height;

	gridContext.strokeStyle = '#CCCCCC';
	gridContext.fillStyle = '#e9e9e9';

	foodContext.lineWidth = 2;
	foodContext.strokeStyle = '#6262ff';
	foodContext.fillStyle = '#9d9dff';

	virusContext.lineWidth = 2;
	virusContext.lineJoin = 'round';
	virusContext.strokeStyle = '#006200';
	virusContext.fillStyle = '#00b100';

	cellCanvas.innerHTML = '';

	map.drawGrid( map.width, map.height, gridContext );
	animate();
}

var animateInterval;

// Recursive function which will attempt to draw at 60fps
function animate()
{
	animateInterval = requestAnimFrame( animate );
	nextTick();
}

// Ticks and draws every animation frame
function nextTick()
{
	if ( map && user )
	{
		user.queue.send( connect.socket );
		map.nextTickNoCollision( user.camera );
		map.draw( foodContext, foodCanvas, virusContext, virusCanvas, gridCanvas, user.camera );
	}
}