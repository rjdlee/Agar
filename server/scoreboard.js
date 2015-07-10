function Scoreboard()
{
	this.list = [];
}

Scoreboard.prototype.getLeaderboard = function ()
{
	var leaderboard = this.list.slice( 0, 10 );

	for ( var i = leaderboard.length - 1; i >= 0; i-- )
	{
		if ( leaderboard[ i ].score === 0 )
			leaderboard.splice( i, 1 );
	}

	return leaderboard;
};

// Add/ update a user's score on the scoreboard. Returns true if they are in the top 10
Scoreboard.prototype.add = function ( id, score, name )
{
	var playerEntry = {
		id: id,
		name: name,
		score: score
	};

	// Remove existing entries for this player
	this.remove( id );

	// Add the player to the leaderboard if their score is in the top 10
	for ( var i = 0; i < 10; i++ )
	{
		if ( i >= this.list.length )
		{
			this.list.push( playerEntry );
			return score > 0;
		}

		if ( score > this.list[ i ].score )
		{
			this.list.splice( i, 0, playerEntry );
			return score > 0;
		}
	}

	this.list.push( playerEntry );
	return false;
};

Scoreboard.prototype.remove = function ( id )
{
	for ( var i = 0; i < this.list.length; i++ )
	{
		if ( this.list[ i ].id === id )
		{
			this.list.splice( i, 1 );
			return i;
		}
	}
};

module.exports = function ()
{
	return new Scoreboard();
};