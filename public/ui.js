/*

Clientside menu, score, and scoreboard

*/

function UI()
{
	this.name = '';
	this.score = 0;

	this.menuElement = this.getID( 'menu' );
	this.scoreElement = this.getID( 'score' );
	this.leaderboardElement = this.getID( 'leaderboard' );
}

UI.prototype.getID = function ( id )
{

	return document.getElementById( id );
};

UI.prototype.getClass = function ( name )
{

	return Array.prototype.slice.call( document.getElementsByClassName( name ) );
};

UI.prototype.drawScore = function ( score )
{
	if ( this.score === score )
		return;

	this.score = score;
	this.scoreElement.innerHTML = 'Mass: ' + score;
};

UI.prototype.drawLeaderboard = function ( leaderboard )
{
	var leaderboardHTML = '<h3>Leaderboard</h3>';

	if ( leaderboard )
	{
		for ( var i = 0; i < leaderboard.length; i++ )
		{
			var name = leaderboard[ i ].name
			if ( name.length > 10 )
				name = name.substr( 0, 10 ) + '...';

			if ( leaderboard[ i ].id === userID )
				leaderboardHTML += '<li><b>' + name + '</li>';
			else
				leaderboardHTML += '<li>' + name + '</li>';
		}
	}

	this.leaderboardElement.innerHTML = leaderboardHTML;
};

UI.prototype.drawMenu = function ()
{

	this.menuElement.style.visibility = 'visible';
};

UI.prototype.hideMenu = function ()
{

	this.menuElement.style.visibility = 'hidden';
};

UI.prototype.reset = function ()
{
	this.drawMenu();
	this.drawScore( 0 );

};

UI.prototype.setListeners = function ( socket )
{
	this.getID( 'menu-play' ).addEventListener( 'click', function ()
	{
		this.name = this.getID( 'menu-name' ).value;
		this.hideMenu();
		socket.play();
	}.bind( this ) );

	document.addEventListener( 'keydown', function ( e )
	{
		if ( e.keyCode === 27 || e.keyCode === 80 )
			this.drawMenu();
	}.bind( this ) );
};