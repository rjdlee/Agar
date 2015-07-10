function getId( id )
{
	return document.getElementById( id );
}

function getClass( name )
{
	return Array.prototype.slice.call( document.getElementsByClassName( name ) );
}

function updateScore( score )
{
	getId( 'score' ).innerHTML = score;
	// updateLeaderboard( score );
}

function updateLeaderboard( score )
{
	for ( var i = 0; i < leaderboard.length; i++ )
	{
		if ( leaderboard[ i ].score < score )
		{
			leaderboard.splice( i, 0,
			{
				score: score
			} );
			break;
		}
	}

	if ( leaderboard.length > 10 )
		leaderboard.splice( 9, leaderboard.length - 10 );
}

function drawLeaderboard()
{
	var leaderboardHTML = '';
	for ( var i = 0; i < leaderboard.length; i++ )
	{
		var id = leaderboard[ i ].id
		if ( id.length > 10 )
			id = id.substr( 0, 10 ) + '...';

		leaderboardHTML += '<li>' + leaderboard[ i ].name + ': ' + leaderboard[ i ].score + '</li>';
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
		toggleMenu();
	} );
} )();