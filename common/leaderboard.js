function Leaderboard( width, height )
{
	this.list = [];
}

Leaderboard.prototype.add = function ( id, name, score )
{
	var isOnLeaderboard = false,
		leaderObject = {
			id: id,
			name: name,
			score: score
		};

	for ( var i = 0; i < this.list.length; i++ )
	{
		var j = i;
		if ( this.list[ i ].id === id )
		{
			this.list.splice( i, 1 );
			j--;
		}

		if ( !isOnLeaderboard && this.list.length > i && this.list[ i ].score < score )
		{
			this.list.splice( i, 0, leaderObject );

			if ( this.list.length > 10 )
				this.list.splice( 9, this.list.length - 10 );

			isOnLeaderboard = true;
			j++;
		}
		i = j;
	}

	if ( !isOnLeaderboard && this.list.length < 10 )
	{
		this.list.push( leaderObject  );
		isOnLeaderboard = true;
	}

	return isOnLeaderboard;
}

module.exports = function ( width, height )
{
	return new Leaderboard( width, height );
};