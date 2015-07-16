/*

Maps player names to img urls

*/

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	module.exports = Avatar;
}

function Avatar()
{
	this.poland = 'img/polandball.svg';
	this.nazi = 'img/nazi.svg';
}