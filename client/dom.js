function getId( id )
{
	return document.getElementById( id );
}

function getClass( name )
{
	return Array.prototype.slice.call( document.getElementsByClassName( name ) );
}

function drawScore( score )
{
	getId( 'score' ).innerHTML = 'Score: ' + score;
}

function drawLeaderboard( userID, leaderboard )
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

	getId( 'leaderboard' ).innerHTML = leaderboardHTML;
}

function toggleMenu()
{
	if ( getId( 'menu' ).style.visibility === 'hidden' )
		getId( 'menu' ).style.visibility = '';
	else
		getId( 'menu' ).style.visibility = 'hidden';
}

( function initMenu()
{
	getId( 'menu-play' ).addEventListener( 'click', function ()
	{
		name = getId( 'menu-name' ).value || 'Tanky';
		init();
		drawScore( 0 );
		drawLeaderboard();
		toggleMenu();
	} );
} )();