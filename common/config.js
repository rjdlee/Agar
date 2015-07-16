/*

Configuration for like everything

*/

var cfg = {

	// Number of times a second to simulate clock
	tick_clock: 1000 / 60,

	// Interval to send full position and velocity to clients
	send_clock: 10,

	map:
	{

		// Size of entire map
		width: 1960,
		height: 1080,

		// Size of background tiles
		tile_size: 20
	},

	cell:
	{
		// Starting cell mass
		mass: 20,

		// Time to cell rejoin multiplier
		rejoin_factor: 3,

		// Mass lost when splitting
		split_loss: 2,

		// Mass needed to split and shoot
		min_mass: 20,
		min_split_mass: 40,
		min_shoot_mass: 25,

		// Amount of mass to shoot
		shoot_mass: 5
	},

	food:
	{
		// Spawn mass
		mass: 2
	},

	virus:
	{
		// Spawn mass
		mass: 25,

		// Mass needed to split
		min_split_mass: 45
	}
};

// NodeJS module when there is no browser window
if ( typeof window === 'undefined' )
{
	module.exports = cfg;
}