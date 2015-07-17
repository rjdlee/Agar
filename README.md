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

## Game Implementation
All the objects in the game (cells, viruses, and food) are based off the Circle class which contains functions for collision detection, movement, mass, and rendering. When rendering to the DOM, it uses the DOMElement class. 

As mentioned, a cell is a player's circles or body and contain functions for collisions with food and viruses as well as between cells from the same player (solid body collision), cells from other players (overlapping body collision). It also contains functions for joining with other cells, exploding from a virus, and shooting food. RejoinTick is the time when the cell can rejoin its brethen. 

Viruses are the spiky green circles which can be fed and split at other players or can split cells above a certain size.

Food are small dots on the map that can be shot from a player's cells or eaten by players' cells'.

Those are the base object classes. The Player class can contain many more cells and combines the functions of the cells into nextTick or nextTickNoCollisions to be run by the game loop. The Controller class inherits from the Player class and provides options for user input and a camera to follow the player.

Avatar (player skins), BISON (binary JSON encoding), Color (random color generation), and Noise (Perlin and Simplex noise generator) classes are helper classes that should be pretty self explanatory. animationFrame.js is in the same boat and basically provides a function for the frontend to run a function around 60 times a second.

Config contains constants for configuring the game balance and such.

Map is the core of the game logic as it keeps track of all the players and has the game loop function.

On the frontend, Connect contains encoding/ sending and decoding/ receiving of information using Socket.IO. UI contains functions for interacting with the DOM (mass, leaderboard, and menu). Menu initializes the canvases and contains the actual game loop functions which are activated by UI and use animationFrame.js.

On the backend, main.js is similar to Connect. There isn't much more to the backend since the Map takes cares of most of the logic.

## TODO:
* Finish implementing the quadtree so clients only receive data about objects near them
* Add a state change queue to every object so rather than the map keeping track of them, they keep track of themselves. This will help with code clarity and efficiency.
* Fix the issue where there are ghost cells that are fixed on the user screen
* Improve the UI aesthetics
* Allow the camera to zoom in and out depending on a player's cells' size
