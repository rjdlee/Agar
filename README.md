# Agar
Based off of http://agar.io/. The goal of this project is to improve over the original version of AgarIO by optimizing performance on less powerful devices and allowing friends to play with one another easier.

## Overview of Application
There are 2 components to this project, the vanilla Javascript frontend and the NodeJS backend with ExpressJS for routing and Socket.IO (with BISON encoding for smaller data sizes) for low latency communication between client and server. The vast majority of the game files are located in a common directory since the frontend and backend run a lot of shared code.

## Server Client Communication Implementation
The backend performs all the logic while the client interpolates between backend sends which occur a number of times per second. This means the client recieves information about new objects (players, cells, food, viruses), deleted objects, position, velocity, and mass changes and uses that information to simulate the game for a short period of time. This ensures the client cannot cheat, but also means there may be higher latency (an issue to be solved still).

## Backend
There is an incomplete implementation of the backend send function which determines the exact changes to the game state that have occured between sends so it may intelligently send smaller snippets of data. The game cycle for the backend is in server/main.js.

## Frontend
The client uses canvas for the background grid, food, and viruses; and the DOM for players/ cells since cells are constantly moving generally and the DOM eliminates the need to clear and redraw so often whereas food and viruses are stationary most of the time. The game cycle for the frontend is in public/main.js, but this is activated by public/connect.js, which is then activated by public/ui.js (the game menu).

## Classes
Each file contains a single class with a block at the top that looks like this:

  if ( typeof window === 'undefined' )
    {
	    var Vector = require( './vector' ),
		    cfg = require( './config' );

  	module.exports = Player;
  }

When there is no window (backend), NodeJS can pick up on the classes declared in each file and also import other classes.

## TODO:
* Finish implementing the quadtree so clients only receive data about objects near them
* Add a state change queue to every object so rather than the map keeping track of them, they keep track of themselves. This will help with code clarity and efficiency.
* Fix the issue where there are ghost cells that are fixed on the user screen
* Improve the UI aesthetics
* Allow the camera to zoom in and out depending on a player's cells' size
